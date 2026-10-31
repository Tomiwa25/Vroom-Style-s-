import { z } from "zod";

export const initializePaymentSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
});

export const verifyPaymentSchema = z.object({
  reference: z.string().min(1, "Payment reference is required"),
});
