import { z } from "zod";

export const createProductSchema = z.object({
    externalId: z.number().int().optional(),
    name: z.string().min(2),
    description: z.string().min(4),
    price: z.number().nonnegative(),
    image: z.string().min(1),
    category: z.string().min(2),
    stock: z.number().int().nonnegative(),
    isActive: z.boolean().optional(),
});

/**
 * Update allows an empty string on `description` because clearing a
 * description is a legitimate admin action. Other string fields must be
 * non-empty when supplied (harms use of "" to clear name/category).
 */
export const updateProductSchema = z.object({
    externalId: z.number().int().nullable().optional(),
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    price: z.number().nonnegative().optional(),
    image: z.string().min(1).optional(),
    category: z.string().min(2).optional(),
    stock: z.number().int().nonnegative().optional(),
    isActive: z.boolean().optional(),
});

export const updateStockSchema = z.object({
    stock: z.number().int().nonnegative(),
});

export const updateOrderStatusSchema = z.object({
    status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

export const adminEntityIdParamSchema = z.object({
    id: z.string().min(1, "ID is required"),
});

export const adminJobIdParamSchema = z.object({
    jobId: z.string().min(1, "jobId is required"),
});

export const adminOrdersQuerySchema = z.object({
    // Accept string query params, coerce to bounded integers.
    skip: z.coerce.number().int().min(0).optional().default(0),
    take: z.coerce.number().int().min(1).max(200).optional().default(50),
});

export const adminJobsQuerySchema = z.object({
    skip: z.coerce.number().int().min(0).optional().default(0),
    take: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const generateCatalogSchema = z.object({
    count: z.number().int().min(1).max(100000).default(100),
    categories: z.array(z.string()).optional(),
    seed: z.number().int().optional(),
    batchSize: z.number().int().min(50).max(2000).optional().default(500),
    includeVariations: z.boolean().optional().default(true),
});
