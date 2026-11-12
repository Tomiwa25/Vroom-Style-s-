import { Request, Response, NextFunction } from "express";
import { idempotencyService, computePayloadHash } from "../services/idempotency.service.js";

export interface IdempotencyOptions {
  required?: boolean;
  ttlHours?: number;
}

/**
 * Express middleware providing database-backed idempotency for mutating endpoints.
 *
 * Checks for the `Idempotency-Key` or `X-Idempotency-Key` HTTP header.
 * - If present, ensures that duplicate requests with the same key replay the original response.
 * - Rejects payload mismatches with HTTP 422 Unprocessable Entity.
 * - Guards against concurrent in-flight requests with HTTP 409 Conflict.
 */
export const idempotencyMiddleware = (options: IdempotencyOptions = {}) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Idempotency applies to state-mutating HTTP methods
    if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") {
      next();
      return;
    }

    const rawKey = req.headers["idempotency-key"] || req.headers["x-idempotency-key"];
    const idempotencyKey = Array.isArray(rawKey) ? rawKey[0] : rawKey;

    if (!idempotencyKey || typeof idempotencyKey !== "string" || !idempotencyKey.trim()) {
      if (options.required) {
        res.status(400).json({
          success: false,
          message: "Idempotency-Key header is required for this operation",
          code: "IDEMPOTENCY_KEY_REQUIRED",
        });
        return;
      }
      next();
      return;
    }

    const trimmedKey = idempotencyKey.trim();
    if (trimmedKey.length < 4 || trimmedKey.length > 255) {
      res.status(400).json({
        success: false,
        message: "Idempotency-Key must be between 4 and 255 characters",
        code: "INVALID_IDEMPOTENCY_KEY",
      });
      return;
    }

    const userId = (req as any).user?.userId || null;
    const scopedKey = userId ? `usr:${userId}:${trimmedKey}` : `anon:${trimmedKey}`;
    const currentHash = computePayloadHash(req.body);

    try {
      const { record, isNew } = await idempotencyService.acquire({
        key: scopedKey,
        userId,
        path: req.originalUrl || req.path,
        method: req.method,
        payload: req.body,
        ttlHours: options.ttlHours,
      });

      if (!isNew) {
        // Record already exists: check payload fingerprint
        if (record.requestHash !== currentHash) {
          res.status(422).json({
            success: false,
            message: "Idempotency key payload mismatch: The payload for this idempotency key does not match the original request",
            code: "IDEMPOTENCY_PAYLOAD_MISMATCH",
          });
          return;
        }

        // Check state
        if (record.status === "RESOLVED") {
          res.setHeader("X-Idempotent-Replay", "true");
          const statusCode = record.statusCode || 200;
          res.status(statusCode).json(record.responseBody);
          return;
        }

        if (record.status === "PROCESSING") {
          res.status(409).json({
            success: false,
            message: "A request with this idempotency key is currently processing. Please retry shortly.",
            code: "IDEMPOTENCY_KEY_LOCKED",
          });
          return;
        }

        // FAILED: a previous attempt crashed mid-execution. Claim the row
        // atomically before re-executing. Without this fence two clients
        // retrying at the same time would both run and both decrement stock.
        if (record.status === "FAILED") {
          const reclaimed = await idempotencyService.reclaim(
            scopedKey,
            record.updatedAt
          );
          if (!reclaimed) {
            res.status(409).json({
              success: false,
              message: "A request with this idempotency key is currently processing. Please retry shortly.",
              code: "IDEMPOTENCY_KEY_LOCKED",
            });
            return;
          }
        }
      }

      // Intercept response to record status and payload upon completion
      const originalJson = res.json.bind(res);
      const originalSend = res.send.bind(res);

      let responseCaptured = false;

      const captureAndPersist = async (statusCode: number, body: any) => {
        if (responseCaptured) return;
        responseCaptured = true;

        try {
          if (statusCode >= 200 && statusCode < 500) {
            // Client error (4xx) or success (2xx/3xx) is a deterministic completed outcome
            await idempotencyService.resolve(scopedKey, statusCode, body);
          } else {
            // Server error (5xx) is marked failed so client can retry
            await idempotencyService.fail(scopedKey);
          }
        } catch (err) {
          console.error("Failed to persist idempotency resolution:", err);
        }
      };

      res.json = (body: any): Response => {
        const statusCode = res.statusCode || 200;
        void captureAndPersist(statusCode, body);
        return originalJson(body);
      };

      res.send = (body: any): Response => {
        const statusCode = res.statusCode || 200;
        let parsed = body;
        if (typeof body === "string") {
          try {
            parsed = JSON.parse(body);
          } catch {
            parsed = body;
          }
        }
        void captureAndPersist(statusCode, parsed);
        return originalSend(body);
      };

      next();
    } catch (error) {
      console.error("Idempotency middleware error:", error);
      next(error);
    }
  };
};

export default idempotencyMiddleware;

