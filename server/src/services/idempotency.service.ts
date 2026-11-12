import crypto from "crypto";
import {
  acquireIdempotencyKey,
  findIdempotencyKey,
  resolveIdempotencyKey,
  failIdempotencyKey,
  pruneExpiredIdempotencyKeys,
} from "../repositories/idempotency.repository.js";

/**
 * Deterministically serialize and hash request payload using SHA-256.
 * Normalizes JSON keys so object order differences don't cause false payload mismatch errors.
 */
export const computePayloadHash = (payload: any): string => {
  if (payload === undefined || payload === null || (typeof payload === "object" && Object.keys(payload).length === 0)) {
    return crypto.createHash("sha256").update("").digest("hex");
  }

  const sortKeys = (obj: any): any => {
    if (obj === null || typeof obj !== "object") {
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map(sortKeys);
    }
    return Object.keys(obj)
      .sort()
      .reduce((acc: any, key: string) => {
        acc[key] = sortKeys(obj[key]);
        return acc;
      }, {});
  };

  const normalizedString = JSON.stringify(sortKeys(payload));
  return crypto.createHash("sha256").update(normalizedString).digest("hex");
};

export const defaultTtlHours = 24;

export const idempotencyService = {
  computePayloadHash,

  acquire: async (params: {
    key: string;
    userId?: string | null;
    path: string;
    method: string;
    payload: any;
    ttlHours?: number;
  }) => {
    const requestHash = computePayloadHash(params.payload);
    const ttl = params.ttlHours || defaultTtlHours;
    const expiresAt = new Date(Date.now() + ttl * 60 * 60 * 1000);

    return acquireIdempotencyKey({
      key: params.key,
      userId: params.userId,
      path: params.path,
      method: params.method,
      requestHash,
      expiresAt,
    });
  },

  find: async (key: string) => {
    return findIdempotencyKey(key);
  },

  resolve: async (key: string, statusCode: number, responseBody: any) => {
    return resolveIdempotencyKey(key, statusCode, responseBody);
  },

  fail: async (key: string) => {
    return failIdempotencyKey(key);
  },

  pruneExpired: async () => {
    return pruneExpiredIdempotencyKeys();
  },
};

export default idempotencyService;

