import prisma from "../config/database.js";
import { IdempotencyStatus } from "@prisma/client";

export interface CreateIdempotencyKeyParams {
  key: string;
  userId?: string | null;
  path: string;
  method: string;
  requestHash: string;
  expiresAt: Date;
}

/**
 * Look up an idempotency key record.
 */
export const findIdempotencyKey = async (key: string) => {
  return prisma.idempotencyKey.findUnique({
    where: { key },
  });
};

/**
 * Atomically create or acquire an idempotency key.
 * If another request inserted the same key concurrently, gracefully returns the existing record.
 */
export const acquireIdempotencyKey = async (params: CreateIdempotencyKeyParams) => {
  try {
    const record = await prisma.idempotencyKey.create({
      data: {
        key: params.key,
        userId: params.userId || null,
        path: params.path,
        method: params.method,
        requestHash: params.requestHash,
        status: IdempotencyStatus.PROCESSING,
        expiresAt: params.expiresAt,
      },
    });
    return { record, isNew: true };
  } catch (error: any) {
    // Prisma P2002 code represents unique constraint violation
    if (error?.code === "P2002") {
      const existing = await findIdempotencyKey(params.key);
      if (existing) {
        return { record: existing, isNew: false };
      }
    }
    throw error;
  }
};

/**
 * Mark an idempotency key as RESOLVED with its HTTP status code and response body.
 */
export const resolveIdempotencyKey = async (
  key: string,
  statusCode: number,
  responseBody: any
) => {
  return prisma.idempotencyKey.update({
    where: { key },
    data: {
      status: IdempotencyStatus.RESOLVED,
      statusCode,
      responseBody: responseBody !== undefined ? responseBody : null,
      updatedAt: new Date(),
    },
  });
};

/**
 * Mark an idempotency key as FAILED or release it on fatal server errors so retries can proceed.
 */
export const failIdempotencyKey = async (key: string) => {
  try {
    return await prisma.idempotencyKey.update({
      where: { key },
      data: {
        status: IdempotencyStatus.FAILED,
        updatedAt: new Date(),
      },
    });
  } catch {
    // If the record was already cleaned or missing, ignore
    return null;
  }
};

/**
 * Prune expired idempotency records.
 */
export const pruneExpiredIdempotencyKeys = async () => {
  return prisma.idempotencyKey.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
};
