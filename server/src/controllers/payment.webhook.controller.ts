import crypto from "crypto";
import { Request, Response } from "express";
import { processPaystackWebhookEvent } from "../services/payment.service.js";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

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
		if (!PAYSTACK_SECRET_KEY) {
			res.status(500).json({
				success: false,
				message: "Paystack secret key is not configured",
			});
			return;
		}

		const signature = req.headers["x-paystack-signature"];
		const signatureValue = Array.isArray(signature) ? signature[0] : signature;
		const rawBody = Buffer.isBuffer(req.body)
			? req.body
			: Buffer.from(JSON.stringify(req.body));
		const expectedSignature = crypto
			.createHmac("sha512", PAYSTACK_SECRET_KEY)
			.update(rawBody)
			.digest("hex");

		if (
			typeof signatureValue !== "string" ||
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
		console.error("Paystack webhook error:", error);
		res.status(400).json({
			success: false,
			message: error instanceof Error ? error.message : "Unable to process webhook",
		});
	}
};

