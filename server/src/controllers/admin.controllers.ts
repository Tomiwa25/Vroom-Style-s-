import { Request, Response } from "express";
import {
    createAdminProduct,
    getAdminStoreStats,
    getAllOrdersForAdmin,
    listAdminProducts,
    updateAdminOrderStatus,
    updateAdminProduct,
    updateAdminProductStock,
} from "../services/admin.service.js";
import { ApiResponse } from "../core/http/api-response.js";
import { asyncHandler } from "../core/http/async-handler.js";

/**
 * HTTP Adapter Controller for Admin operations.
 * Unpacks validated admin payloads from Gateway boundary and delegates to AdminService.
 */
export const listAdminProductsController = asyncHandler(async (req: Request, res: Response) => {
    const skip = Number(req.query.skip) || 0;
    const take = Number(req.query.take) || 50;

    const result = await listAdminProducts(skip, take);
    return ApiResponse.success(res, result, "Admin products retrieved successfully");
});

export const createAdminProductController = asyncHandler(async (req: Request, res: Response) => {
    const product = await createAdminProduct(req.body);
    return ApiResponse.created(res, product, "Product created successfully");
});

export const updateAdminProductController = asyncHandler(async (req: Request, res: Response) => {
    const rawId = req.params.id;
    const productId = Array.isArray(rawId) ? rawId[0] : rawId;

    const product = await updateAdminProduct(productId, req.body);
    return ApiResponse.success(res, product, "Product updated successfully");
});

export const updateAdminStockController = asyncHandler(async (req: Request, res: Response) => {
    const rawId = req.params.id;
    const productId = Array.isArray(rawId) ? rawId[0] : rawId;
    const { stock } = req.body;

    const product = await updateAdminProductStock(productId, stock);
    return ApiResponse.success(res, product, "Product stock updated successfully");
});

export const getAdminOrdersController = asyncHandler(async (_req: Request, res: Response) => {
    const orders = await getAllOrdersForAdmin();
    return ApiResponse.success(res, orders, "All customer orders retrieved successfully");
});

export const updateAdminOrderStatusController = asyncHandler(async (req: Request, res: Response) => {
    const rawId = req.params.id;
    const orderId = Array.isArray(rawId) ? rawId[0] : rawId;
    const { status } = req.body;

    const order = await updateAdminOrderStatus(orderId, status);
    return ApiResponse.success(res, order, "Order status updated successfully");
});

export const getAdminStoreStatsController = asyncHandler(async (_req: Request, res: Response) => {
    const stats = await getAdminStoreStats();
    return ApiResponse.success(res, stats, "Store telemetry retrieved successfully");
});
