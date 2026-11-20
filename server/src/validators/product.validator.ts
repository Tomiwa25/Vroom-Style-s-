import { z } from "zod";

export const getProductsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(12),
  skip: z.coerce.number().int().min(0).default(0),
});

export const getProductByIdParamsSchema = z.object({
  id: z.coerce.number().int().positive("Invalid Product ID"),
});

export const searchProductsQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .min(1, "Search query is required")
    .max(100, "Search query cannot exceed 100 characters"),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  skip: z.coerce.number().int().min(0).default(0),
  category: z.string().trim().max(100).optional(),
});
