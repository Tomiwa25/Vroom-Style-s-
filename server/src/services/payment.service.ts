import crypto from "crypto";
import paystackApi from "./external/paystack.service";
import { createPayment, findPaymentByReference, updatePaymentSuccess } from "../repositories/payment.repository";
import { markOrderAsPaid } from "./order.service";
import prisma from "../config/database.js";

export const initializePayment = async (
	orderId: string,
	userId: string,
) => {
	const order = await prisma.order.findUnique({
		where: { id: orderId, userId },
        include: {user: true, payment: true}
	});

	if (!order) {
		throw new Error("Order not found");
	}

	if (order.paymentStatus !== "PENDING") {
		throw new Error("Order payment has already been processed");
	}
	if (order.payment && order.payment.status === "PAID") {
		throw new Error("Order payment has already been processed");
	}

	const reference = `VROOM-${order.id}-${crypto.randomBytes(8).toString("hex")}`;
	const callbackUrl = process.env.CLIENT_URL || "http://localhost:5173";
	const response = await paystackApi.post("/transaction/initialize", {
		email: order.user.email,
		amount: Math.round(Number(order.total) * 100),
		reference,
		currency: "NGN",
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

export const verifyPayment = async (
	reference: string,
	userId: string,
) => {
	const payment = await findPaymentByReference(reference);

	if (!payment) {
		throw new Error("Payment not found");
	}
    if (payment.order.userId !== userId) {
		throw new Error("Access Denied");
	}

	const response = await paystackApi.get(
		`/transaction/verify/${encodeURIComponent(reference)}`,
	);
	const transaction = response.data.data;

	if (transaction.status !== "success") {
		throw new Error("Payment has not been completed");
	}

    const expectedAmount = Math.round(
        Number(payment.amount) * 100
    );  

	if (transaction.amount !== expectedAmount) {
		throw new Error("Payment amount does not match the order amount");
	}
    if (payment.status === "PENDING") {
		await updatePaymentSuccess(reference);
	    await markOrderAsPaid(payment.orderId);
	}

	return {
        success: true,
        status: "success",
        reference,
    };
};

/**
 * Domain business logic for processing verified Paystack webhook events.
 * Updates payment status and marks orders as paid when payment amounts match.
 */
export const processPaystackWebhookEvent = async (event: any) => {
	if (event?.event === "charge.success") {
		const transaction = event.data;
		const reference = transaction?.reference;
		const payment = reference
			? await findPaymentByReference(reference)
			: null;

		if (payment && payment.status !== "PAID") {
			const expectedAmount = Math.round(Number(payment.amount) * 100);

			if (Number(transaction.amount) !== expectedAmount) {
				throw new Error("Payment amount does not match the order amount");
			}

			await updatePaymentSuccess(reference);
			await markOrderAsPaid(payment.orderId);
		}
	}

	return { success: true };
};