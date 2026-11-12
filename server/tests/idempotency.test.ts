import { describe, expect, it, vi, beforeEach } from "vitest";
import { computePayloadHash, idempotencyService } from "../src/services/idempotency.service.js";
import { idempotencyMiddleware } from "../src/middleware/idempotency.middleware.js";
import { processPaystackWebhookEvent } from "../src/services/payment.service.js";
import * as idempotencyRepo from "../src/repositories/idempotency.repository.js";
import * as paymentRepo from "../src/repositories/payment.repository.js";
import * as orderService from "../src/services/order.service.js";

describe("Database-Backed Idempotency Engine & Middleware", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("Deterministic Payload Fingerprinting (SHA-256)", () => {
    it("produces identical hashes regardless of object key order", () => {
      const payload1 = { productId: "prod_1", quantity: 2, size: "M" };
      const payload2 = { size: "M", quantity: 2, productId: "prod_1" };

      const hash1 = computePayloadHash(payload1);
      const hash2 = computePayloadHash(payload2);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA-256 hex length
    });

    it("produces different hashes when payload values differ", () => {
      const payload1 = { productId: "prod_1", quantity: 2 };
      const payload2 = { productId: "prod_1", quantity: 3 };

      const hash1 = computePayloadHash(payload1);
      const hash2 = computePayloadHash(payload2);

      expect(hash1).not.toBe(hash2);
    });

    it("handles undefined, null, or empty payloads gracefully with stable hash", () => {
      const hashEmptyObj = computePayloadHash({});
      const hashNull = computePayloadHash(null);
      const hashUndefined = computePayloadHash(undefined);

      expect(hashEmptyObj).toBe(hashNull);
      expect(hashNull).toBe(hashUndefined);
    });
  });

  describe("Idempotency Middleware Behavior", () => {
    it("skips idempotency processing for non-mutating GET requests", async () => {
      const middleware = idempotencyMiddleware();
      const req: any = { method: "GET", headers: { "idempotency-key": "some-key" } };
      const res: any = {};
      const next = vi.fn();

      await middleware(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it("passes through if Idempotency-Key header is absent and not required", async () => {
      const middleware = idempotencyMiddleware({ required: false });
      const req: any = { method: "POST", headers: {}, body: { test: true } };
      const res: any = {};
      const next = vi.fn();

      await middleware(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it("returns HTTP 400 when Idempotency-Key header is absent but required", async () => {
      const middleware = idempotencyMiddleware({ required: true });
      const req: any = { method: "POST", headers: {}, body: { test: true } };
      const res: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const next = vi.fn();

      await middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ code: "IDEMPOTENCY_KEY_REQUIRED" })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it("rejects invalid idempotency keys with length < 4 or > 255 chars (HTTP 400)", async () => {
      const middleware = idempotencyMiddleware();
      const req: any = {
        method: "POST",
        headers: { "idempotency-key": "abc" }, // only 3 chars
        body: { test: true },
      };
      const res: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const next = vi.fn();

      await middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ code: "INVALID_IDEMPOTENCY_KEY" })
      );
    });

    it("returns HTTP 422 IDEMPOTENCY_PAYLOAD_MISMATCH if payload differs from original request", async () => {
      const middleware = idempotencyMiddleware();
      const body = { items: [{ productId: "p1", quantity: 5 }] };

      // Mock acquire returning existing record with different hash
      vi.spyOn(idempotencyService, "acquire").mockResolvedValue({
        record: {
          id: "rec_1",
          key: "usr:u1:test-key",
          userId: "u1",
          path: "/api/orders",
          method: "POST",
          requestHash: "different_hash_value_12345",
          status: "RESOLVED" as any,
          statusCode: 201,
          responseBody: { success: true },
          createdAt: new Date(),
          updatedAt: new Date(),
          expiresAt: new Date(Date.now() + 86400000),
        },
        isNew: false,
      });

      const req: any = {
        method: "POST",
        headers: { "idempotency-key": "test-key" },
        user: { userId: "u1" },
        body,
        path: "/api/orders",
      };
      const res: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const next = vi.fn();

      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ code: "IDEMPOTENCY_PAYLOAD_MISMATCH" })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it("replays cached status and response with X-Idempotent-Replay header when record is RESOLVED", async () => {
      const middleware = idempotencyMiddleware();
      const body = { items: [{ productId: "p1", quantity: 1 }] };
      const currentHash = computePayloadHash(body);

      const cachedResponse = {
        success: true,
        data: { id: "order_abc123", total: 50000 },
      };

      vi.spyOn(idempotencyService, "acquire").mockResolvedValue({
        record: {
          id: "rec_1",
          key: "usr:u1:test-key",
          userId: "u1",
          path: "/api/orders",
          method: "POST",
          requestHash: currentHash,
          status: "RESOLVED" as any,
          statusCode: 201,
          responseBody: cachedResponse,
          createdAt: new Date(),
          updatedAt: new Date(),
          expiresAt: new Date(Date.now() + 86400000),
        },
        isNew: false,
      });

      const req: any = {
        method: "POST",
        headers: { "idempotency-key": "test-key" },
        user: { userId: "u1" },
        body,
        path: "/api/orders",
      };
      const res: any = {
        setHeader: vi.fn(),
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const next = vi.fn();

      await middleware(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith("X-Idempotent-Replay", "true");
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(cachedResponse);
      expect(next).not.toHaveBeenCalled();
    });

    it("returns HTTP 409 IDEMPOTENCY_KEY_LOCKED when request is currently PROCESSING", async () => {
      const middleware = idempotencyMiddleware();
      const body = { items: [{ productId: "p1", quantity: 1 }] };
      const currentHash = computePayloadHash(body);

      vi.spyOn(idempotencyService, "acquire").mockResolvedValue({
        record: {
          id: "rec_1",
          key: "usr:u1:test-key",
          userId: "u1",
          path: "/api/orders",
          method: "POST",
          requestHash: currentHash,
          status: "PROCESSING" as any,
          statusCode: null,
          responseBody: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          expiresAt: new Date(Date.now() + 86400000),
        },
        isNew: false,
      });

      const req: any = {
        method: "POST",
        headers: { "idempotency-key": "test-key" },
        user: { userId: "u1" },
        body,
        path: "/api/orders",
      };
      const res: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const next = vi.fn();

      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ code: "IDEMPOTENCY_KEY_LOCKED" })
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("Paystack Webhook Idempotent Reconciler", () => {
    it("processes charge.success event and marks it RESOLVED in idempotency table", async () => {
      const reference = "VROOM-order-999-ref123";
      const event = {
        event: "charge.success",
        data: {
          reference,
          amount: 5000000, // 50,000 NGN
        },
      };

      vi.spyOn(paymentRepo, "findPaymentByReference").mockResolvedValue({
        id: "pay_1",
        orderId: "ord_999",
        amount: "50000" as any,
        status: "PENDING" as any,
        reference,
        paidAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        order: { userId: "user_1" },
      } as any);

      vi.spyOn(paymentRepo, "updatePaymentSuccess").mockResolvedValue({} as any);
      vi.spyOn(orderService, "markOrderAsPaid").mockResolvedValue({} as any);
      vi.spyOn(idempotencyRepo, "acquireIdempotencyKey").mockResolvedValue({
        record: {
          id: "key_1",
          key: `webhook:paystack:charge.success:${reference}`,
          status: "PROCESSING",
        } as any,
        isNew: true,
      });
      vi.spyOn(idempotencyRepo, "resolveIdempotencyKey").mockResolvedValue({} as any);

      const result = await processPaystackWebhookEvent(event);

      expect(result.success).toBe(true);
      expect(paymentRepo.updatePaymentSuccess).toHaveBeenCalledWith(reference);
      expect(orderService.markOrderAsPaid).toHaveBeenCalledWith("ord_999");
      expect(idempotencyRepo.resolveIdempotencyKey).toHaveBeenCalledWith(
        `webhook:paystack:charge.success:${reference}`,
        200,
        { success: true }
      );
    });

    it("short-circuits duplicate webhook retries without re-executing order updates", async () => {
      const reference = "VROOM-order-999-ref123";
      const event = {
        event: "charge.success",
        data: {
          reference,
          amount: 5000000,
        },
      };

      // Mock acquire returning existing RESOLVED record
      vi.spyOn(idempotencyRepo, "acquireIdempotencyKey").mockResolvedValue({
        record: {
          id: "key_1",
          key: `webhook:paystack:charge.success:${reference}`,
          status: "RESOLVED",
        } as any,
        isNew: false,
      });

      const updatePaymentSpy = vi.spyOn(paymentRepo, "updatePaymentSuccess");
      const markOrderSpy = vi.spyOn(orderService, "markOrderAsPaid");

      const result = await processPaystackWebhookEvent(event);

      expect(result.success).toBe(true);
      expect(result.idempotentReplay).toBe(true);

      // Verify no DB mutations occurred!
      expect(updatePaymentSpy).not.toHaveBeenCalled();
      expect(markOrderSpy).not.toHaveBeenCalled();
    });
  });
});
