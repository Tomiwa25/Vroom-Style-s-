import { z } from "zod";

export const addCartItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z
    .number({ message: "Quantity must be a valid number" })
    .int("Quantity must be an integer")
    .min(1, "Quantity must be at least 1")
    .max(50, "Quantity cannot exceed 50 items per line"),
});

export const updateCartQuantitySchema = z.object({
  quantity: z
    .number({ message: "Quantity must be a valid number" })
    .int("Quantity must be an integer")
    .min(1, "Quantity must be at least 1")
    .max(50, "Quantity cannot exceed 50 items per line"),
});

export const cartItemIdParamSchema = z.object({
  id: z.string().min(1, "Cart item ID is required"),
});
