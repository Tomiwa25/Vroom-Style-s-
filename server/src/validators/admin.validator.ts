import { z } from "zod";

export const createProductSchema = z.object({
    externalId: z.number().int().optional(),
    name: z.string().min(2),
    description: z.string().min(4),
    price: z.number().nonnegative(),
    image: z.string().min(1),
    category: z.string().min(2),
    stock: z.number().int().nonnegative(),
});

export const updateProductSchema = z.object({
    externalId: z.number().int().optional(),
    name: z.string().min(2).optional(),
    description: z.string().min(4).optional(),
    price: z.number().nonnegative().optional(),
    image: z.string().min(1).optional(),
    category: z.string().min(2).optional(),
    stock: z.number().int().nonnegative().optional(),
});

export const updateStockSchema = z.object({
    stock: z.number().int().nonnegative(),
});

export const updateOrderStatusSchema = z.object({
    status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
});
