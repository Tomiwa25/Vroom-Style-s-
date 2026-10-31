import { Request, Response } from "express";
import {
    getProducts,
    getProductById,
    searchProductsService,
} from "../services/product.service.js";
import { getActiveCacheDriverName } from "../lib/cache.js";
import { ApiResponse } from "../core/http/api-response.js";
import { asyncHandler } from "../core/http/async-handler.js";

/**
 * HTTP Adapter Controller for Products.
 * Intercepts requests, sets cache driver headers, and delegates query operations to ProductService.
 */
export const getProductsController = asyncHandler(async (req: Request, res: Response) => {
    const rawLimit = Number(req.query.limit);
    const rawSkip = Number(req.query.skip);

    const limit = Number.isInteger(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : 12;
    const skip = Number.isInteger(rawSkip) && rawSkip >= 0 ? rawSkip : 0;

    const result = await getProducts(limit, skip);

    res.setHeader("X-Cache-Driver", getActiveCacheDriverName());
    return ApiResponse.success(res, result, "All Product retrieve successfully");
});

export const getProductByIdController = asyncHandler(async (req: Request, res: Response) => {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const productId = Number(id);

    if (!Number.isInteger(productId) || productId <= 0) {
        res.status(400).json({
            success: false,
            message: "Invalid Product ID",
        });
        return;
    }

    const product = await getProductById(productId);

    res.setHeader("X-Cache-Driver", getActiveCacheDriverName());
    return ApiResponse.success(res, product);
});

export const searchProductsController = asyncHandler(async (req: Request, res: Response) => {
    const query = String(req.query.q ?? "").trim();
    if (!query) {
        res.status(400).json({
            success: false,
            message: "Search query is required",
        });
        return;
    }

    const rawLimit = Number(req.query.limit);
    const rawSkip = Number(req.query.skip);

    const limit = Number.isInteger(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : 12;
    const skip = Number.isInteger(rawSkip) && rawSkip >= 0 ? rawSkip : 0;

    const result = await searchProductsService(query, limit, skip);

    res.setHeader("X-Cache-Driver", getActiveCacheDriverName());
    return ApiResponse.success(res, result, "Products search completed successfully");
});
