import { Request, Response } from "express";
import {
	initializePayment,
	verifyPayment,
} from "../services/payment.service.js";
import { getAuthUser } from "../middleware/auth.middleware.js";
import { ApiResponse } from "../core/http/api-response.js";
import { asyncHandler } from "../core/http/async-handler.js";

/**
 * HTTP Adapter Controller for Payments.
 * Forwards user credentials and validated payment payloads to PaymentService.
 */
export const initializePaymentController = asyncHandler(async (
	req: Request,
	res: Response,
) => {
	const user = getAuthUser(req);
	const { orderId } = req.body;

	const payment = await initializePayment(orderId, user.userId);

	return ApiResponse.success(res, payment, "Payment initialized successfully");
});

export const verifyPaymentController = asyncHandler(async (
	req: Request,
	res: Response,
) => {
	const user = getAuthUser(req);
	const { reference } = req.body;

	const payment = await verifyPayment(reference, user.userId);

	return ApiResponse.success(res, payment, "Payment verified successfully");
});
