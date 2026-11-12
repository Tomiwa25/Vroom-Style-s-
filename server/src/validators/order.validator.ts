import { z } from "zod";

export const checkoutItemSchema = z
  .object({
    productId: z.string().min(1).optional(),
    externalId: z.number().int().optional(),
    quantity: z.number().int().min(1, "Quantity must be at least 1").max(999),
  })
  .refine((item) => Boolean(item.productId) || typeof item.externalId === "number", {
    message: "Each item requires either productId or externalId",
  });

const shippingSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  phone: z.string().trim().min(7).max(30).optional(),
  address: z.string().trim().min(5).max(500).optional(),
  city: z.string().trim().min(1).max(100).optional(),
  notes: z.string().trim().max(500).optional(),
});

const baseCheckoutSchema = z.object({
  // Legacy clients send `{ items }` without `source`. Inferring the source
  // lets them keep working, but the cart is only cleared when the server
  // actually built the order from the cart.
  source: z.enum(["cart", "items"]).optional(),
  items: z.array(checkoutItemSchema).max(100).optional(),
  deliveryMethod: z.enum(["PAYSTACK", "POD"]).default("PAYSTACK"),
  shipping: shippingSchema.optional(),
});

export const checkoutSchema = baseCheckoutSchema
  .transform((data) => ({
    ...data,
    source:
      data.source ?? (data.items && data.items.length > 0 ? "items" : "cart"),
  }))
  .pipe(
    z.object({
      source: z.enum(["cart", "items"]),
      items: z.array(checkoutItemSchema).max(100).optional(),
      deliveryMethod: z.enum(["PAYSTACK", "POD"]),
      shipping: shippingSchema.optional(),
    })
  )
  .superRefine((data, ctx) => {
    if (data.source === "items" && (!data.items || data.items.length === 0)) {
      ctx.addIssue({
        code: "custom",
        path: ["items"],
        message: "At least one item is required when source is 'items'.",
      });
    }
    if (data.deliveryMethod === "POD") {
      const s = data.shipping;
      if (!s?.address || !s?.city || !s?.phone) {
        ctx.addIssue({
          code: "custom",
          path: ["shipping"],
          message:
            "Payment on Delivery requires a shipping address, city, and phone number.",
        });
      }
    }
  });

export const trackOrderParamsSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
});
