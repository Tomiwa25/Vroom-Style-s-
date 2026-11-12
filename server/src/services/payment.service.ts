import crypto from "crypto";
import paystackApi from "./external/paystack.service.js";
import {
	findPaymentByReference,
	createPayment,
} from "../repositories/payment.repository.js";
import { markOrderAsPaid } from "./order.service.js";
import prisma from "../config/database.js";
import { idempotencyService } from "./idempotency.service.js";
import {
	BadRequestError,
	ForbiddenError,
	NotFoundError,
	ConflictError,
} from "../core/errors/app-error.js";

const SUPPORTED_CURRENCY = "NGN";

export const initializePayment = async (
	orderId: string,
	userId: string,
) => {
	const order = await prisma.order.findUnique({
		where: { id: orderId },
		include: { user: true, payment: true },
	});

	if (!order || order.userId !== userId) {
		throw new NotFoundError("Order not found");
	}
	if (order.status === "CANCELLED") {
		throw new BadRequestError("This order has been cancelled and cannot be paid for.");
	}
	if (order.paymentStatus !== "PENDING") {
		throw new BadRequestError("Order payment has already been processed");
	}
	if (order.payment && order.payment.status === "PAID") {
		throw new BadRequestError("Order payment has already been processed");
	}
	if (order.deliveryMethod === "POD") {
		throw new BadRequestError(
			"This order is set to Payment on Delivery and does not require an online payment."
		);
	}

	const reference = `VROOM-${order.id}-${crypto.randomBytes(8).toString("hex")}`;
	const callbackUrl = process.env.CLIENT_URL || "http://localhost:5173";
	const response = await paystackApi.post("/transaction/initialize", {
		email: order.user.email,
		amount: Math.round(Number(order.total) * 100),
		reference,
		currency: SUPPORTED_CURRENCY,
		callback_url: callbackUrl,
		metadata: {
			orderId: order.id,
			userId: order.userId,
		},
	});

	if (order.payment) {
		await prisma.payment.update({
			where: { id: order.payment.id },
			data: {
				reference,
				amount: Number(order.total),
				status: "PENDING",
			},
		});
	} else {
		await createPayment({
			orderId: order.id,
			reference,
			amount: Number(order.total),
		});
	}

	return {
		authorizationUrl: response.data.data.authorization_url,
		accessCode: response.data.data.access_code,
		reference: response.data.data.reference,
	};
};

/**
 * Shared "this payment succeeded, apply it" step. Both verifyPayment (client
 * redirect back) and the Paystack webhook go through here. Callers pass the
 * authoritative amount/currency from the Paystack transaction object.
 */
const applySuccessfulTransaction = async (params: {
	reference: string;
	amountKobo: number;
	currency: string;
}): Promise<{ alreadyApplied: boolean; orderId: string }> => {
	const payment = await findPaymentByReference(params.reference);
	if (!payment) {
		throw new NotFoundError("Payment not found");
	}

	if (params.currency && params.currency !== SUPPORTED_CURRENCY) {
		throw new BadRequestError(
			`Payment currency mismatch: expected ${SUPPORTED_CURRENCY}, got ${params.currency}`
		);
	}

	const expectedAmount = Math.round(Number(payment.amount) * 100);
	if (Number(params.amountKobo) !== expectedAmount) {
		throw new ConflictError(
			"Payment amount does not match the order amount"
		);
	}

	if (payment.status === "PAID") {
		return { alreadyApplied: true, orderId: payment.orderId };
	}

	await markOrderAsPaid(payment.orderId);
	return { alreadyApplied: false, orderId: payment.orderId };
};

export const verifyPayment = async (
	reference: string,
	userId: string,
) => {
	const payment = await findPaymentByReference(reference);

	if (!payment) {
		throw new NotFoundError("Payment not found");
	}
	if (payment.order.userId !== userId) {
		throw new ForbiddenError("Access Denied");
	}

	const response = await paystackApi.get(
		`/transaction/verify/${encodeURIComponent(reference)}`,
	);
	const transaction = response.data.data;

	if (transaction.status !== "success") {
		throw new BadRequestError("Payment has not been completed");
	}

	const { alreadyApplied } = await applySuccessfulTransaction({
		reference,
		amountKobo: Number(transaction.amount),
		currency: String(transaction.currency ?? ""),
	});

	return {
		success: true,
		status: "success",
		reference,
		orderId: payment.orderId,
		alreadyApplied,
	};
};

/**
 * Domain business logic for processing verified Paystack webhook events.
 * Idempotently updates payment status and marks orders as paid when payment
 * amounts and currencies match.
 */
export const processPaystackWebhookEvent = async (event: any) => {
	if (event?.event !== "charge.success") {
		// Ack unknown events with 200 so Paystack stops retrying.
		return { success: true, ignored: true };
	}

	const transaction = event.data;
	const reference = transaction?.reference;
	if (!reference) {
		return { success: false, message: "Missing reference in charge.success event" };
	}

	const naturalKey = `webhook:paystack:${event.event}:${reference}`;

	const { record, isNew } = await idempotencyService.acquire({
		key: naturalKey,
		userId: null,
		path: "/api/payments/webhook",
		method: "POST",
		payload: event,
		ttlHours: 48,
	});

	if (!isNew && record.status === "RESOLVED") {
		return { success: true, idempotentReplay: true };
	}

	try {
		await applySuccessfulTransaction({
			reference,
			amountKobo: Number(transaction.amount),
			currency: String(transaction.currency ?? ""),
		});
		await idempotencyService.resolve(naturalKey, 200, { success: true });
	} catch (error) {
		await idempotencyService.fail(naturalKey);
		throw error;
	}

	return { success: true };
};
