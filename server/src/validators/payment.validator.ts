import { z } from "zod";

export const initializePaymentSchema = z.object({
  orderId: z.string().uuid("Order ID must be a valid UUID"),
});

export const verifyPaymentSchema = z.object({
  reference: z.string().min(1, "Payment reference is required"),
});
