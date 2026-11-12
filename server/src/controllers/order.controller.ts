import { Request, Response } from "express";
import {
	checkout,
	getOrderTracking,
	getUserOrdersWithExpiry,
} from "../services/order.service.js";
import { getAuthUser } from "../middleware/auth.middleware.js";
import { ApiResponse } from "../core/http/api-response.js";
import { asyncHandler } from "../core/http/async-handler.js";

export const checkoutController = asyncHandler(async (req: Request, res: Response) => {
	const user = getAuthUser(req);
	const body = req.body ?? {};

	const order = await checkout(user.userId, {
		source: body.source ?? "cart",
		items: body.items,
		deliveryMethod: body.deliveryMethod ?? "PAYSTACK",
		shipping: body.shipping,
	});

	return ApiResponse.created(res, order, "Order created successfully");
});

export const getOrderController = asyncHandler(async (req: Request, res: Response) => {
	const user = getAuthUser(req);
	const orders = await getUserOrdersWithExpiry(user.userId);

	return ApiResponse.success(res, orders);
});

export const trackOrderController = asyncHandler(async (req: Request, res: Response) => {
	const user = getAuthUser(req);
	const rawOrderId = req.params.orderId;
	const orderId = Array.isArray(rawOrderId) ? rawOrderId[0] : rawOrderId;

	const isAdmin = user.role === "ADMIN";
	const tracking = await getOrderTracking(orderId, user.userId, isAdmin);

	return ApiResponse.success(res, tracking, "Order tracking details retrieved");
});
