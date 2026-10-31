import { Request, Response } from "express";
import { checkout, getOrderTracking, getUserOrders } from "../services/order.service.js";
import { getAuthUser } from "../middleware/auth.middleware.js";
import { ApiResponse } from "../core/http/api-response.js";
import { asyncHandler } from "../core/http/async-handler.js";

/**
 * HTTP Adapter Controller for Orders.
 * Extracts user context and validated payloads from the Gateway perimeter,
 * delegating domain operations to OrderService.
 */
export const checkoutController = asyncHandler(async (req: Request, res: Response) => {
	const user = getAuthUser(req);
	const order = await checkout(user.userId, req.body?.items);

	return ApiResponse.created(res, order, "Order created successfully");
});

export const getOrderController = asyncHandler(async (req: Request, res: Response) => {
	const user = getAuthUser(req);
	const orders = await getUserOrders(user.userId);

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