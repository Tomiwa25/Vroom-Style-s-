import { z } from "zod";

export const checkoutItemSchema = z.object({
  productId: z.string().optional(),
  externalId: z.number().int().optional(),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
});

export const checkoutSchema = z.object({
  items: z.array(checkoutItemSchema).optional(),
}).optional().default({});

export const trackOrderParamsSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
});
