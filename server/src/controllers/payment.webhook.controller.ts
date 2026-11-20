import crypto from "crypto";
import { Request, Response } from "express";
import { processPaystackWebhookEvent } from "../services/payment.service.js";

/**
 * Gateway Webhook Controller for Paystack.
 * Intercepts HMAC signature at perimeter, verifies authenticity,
 * and passes the event payload down to the payment service.
 */
export const paystackWebhookController = async (
	req: Request,
	res: Response,
) => {
	try {
		const secretKey = process.env.PAYSTACK_SECRET_KEY;
		if (!secretKey) {
			res.status(500).json({
				success: false,
				message: "Paystack secret key is not configured",
			});
			return;
		}

		const signature = req.headers["x-paystack-signature"];
		const signatureValue = Array.isArray(signature) ? signature[0] : signature;

		if (!signatureValue || typeof signatureValue !== "string") {
			res.status(401).json({
				success: false,
				message: "Missing webhook signature header",
			});
			return;
		}

		const rawBody = Buffer.isBuffer(req.body)
			? req.body
			: Buffer.from(typeof req.body === "string" ? req.body : JSON.stringify(req.body));
		const expectedSignature = crypto
			.createHmac("sha512", secretKey)
			.update(rawBody)
			.digest("hex");

		if (
			signatureValue.length !== expectedSignature.length ||
			!crypto.timingSafeEqual(
				Buffer.from(signatureValue),
				Buffer.from(expectedSignature),
			)
		) {
			res.status(401).json({
				success: false,
				message: "Invalid webhook signature",
			});
			return;
		}

		const event = Buffer.isBuffer(req.body)
			? JSON.parse(req.body.toString("utf8"))
			: req.body;

		await processPaystackWebhookEvent(event);

		res.status(200).json({ success: true });
	} catch (error) {
		if (process.env.NODE_ENV !== "test") {
			console.error("Paystack webhook error:", error);
		}
		res.status(400).json({
			success: false,
			message: error instanceof Error ? error.message : "Unable to process webhook",
		});
	}
};

