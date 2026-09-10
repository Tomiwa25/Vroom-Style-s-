import crypto from "crypto";
import { Request, Response } from "express";
import {
	findPaymentByReference,
	updatePaymentSuccess,
} from "../repositories/payment.repository.js";
import { markOrderAsPaid } from "../services/order.service.js";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

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

		if (event.event === "charge.success") {
			const transaction = event.data;
			const reference = transaction?.reference;
			const payment = reference
				? await findPaymentByReference(reference)
				: null;

			if (payment && payment.status !== "PAID") {
				const expectedAmount = Math.round(Number(payment.amount) * 100);

				if (Number(transaction.amount) !== expectedAmount) {
					res.status(400).json({
						success: false,
						message: "Payment amount does not match the order amount",
					});
					return;
				}

				await updatePaymentSuccess(reference);
				await markOrderAsPaid(payment.orderId);
			}
		}

		res.status(200).json({ success: true });
	} catch (error) {
		console.error("Paystack webhook error:", error);
		res.status(400).json({
			success: false,
			message: "Unable to process webhook",
		});
	}
};
