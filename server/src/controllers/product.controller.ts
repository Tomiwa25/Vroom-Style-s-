import { Request, Response } from "express";
import {
    getProducts,
    getProductByUuid,
    getProductByExternalId,
    searchProductsService,
    MAX_PRODUCT_PAGE_SIZE,
} from "../services/product.service.js";
import { getActiveCacheDriverName } from "../lib/cache.js";
import { ApiResponse } from "../core/http/api-response.js";
import { asyncHandler } from "../core/http/async-handler.js";

const parsePagination = (req: Request) => {
    const rawLimit = Number(req.query.limit);
    const rawSkip = Number(req.query.skip);

    const limit =
        Number.isInteger(rawLimit) && rawLimit > 0
            ? Math.min(rawLimit, MAX_PRODUCT_PAGE_SIZE)
            : 12;
    const skip = Number.isInteger(rawSkip) && rawSkip >= 0 ? rawSkip : 0;
    return { limit, skip };
};

const readString = (value: unknown): string | undefined => {
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
};

export const getProductsController = asyncHandler(async (req: Request, res: Response) => {
    const { limit, skip } = parsePagination(req);

    // Accept the full alias set so clients can use whichever is natural:
    // category, q/search, and sort-agnostic filters.
    const category = readString(req.query.category);
    const query =
        readString(req.query.q) ??
        readString(req.query.search) ??
        readString(req.query.query);

    const result = query
        ? await searchProductsService(query, limit, skip, { category })
        : await getProducts(limit, skip, { category });

    res.setHeader("X-Cache-Driver", getActiveCacheDriverName());
    return ApiResponse.success(res, result, "Products retrieved successfully");
});

/**
 * `/products/:id` accepts either:
 *  - a database UUID (preferred; returned as `id` on every product), or
 *  - the legacy numeric `externalId` (used by older clients and links).
 * The two are unambiguous: UUIDs contain hyphens, external ids are ints.
 */
export const getProductByIdController = asyncHandler(async (req: Request, res: Response) => {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    if (isUuid) {
        const product = await getProductByUuid(id);
        res.setHeader("X-Cache-Driver", getActiveCacheDriverName());
        return ApiResponse.success(res, product);
    }

    const externalId = Number(id);
    if (!Number.isInteger(externalId) || externalId <= 0) {
        res.status(400).json({
            success: false,
            message: "Invalid Product ID",
        });
        return;
    }

    const product = await getProductByExternalId(externalId);
    res.setHeader("X-Cache-Driver", getActiveCacheDriverName());
    return ApiResponse.success(res, product);
});

export const searchProductsController = asyncHandler(async (req: Request, res: Response) => {
    const query =
        readString(req.query.q) ??
        readString(req.query.search) ??
        readString(req.query.query);

    if (!query) {
        res.status(400).json({
            success: false,
            message: "Search query is required",
        });
        return;
    }

    const { limit, skip } = parsePagination(req);
    const category = readString(req.query.category);

    const result = await searchProductsService(query, limit, skip, { category });

    res.setHeader("X-Cache-Driver", getActiveCacheDriverName());
    return ApiResponse.success(res, result, "Products search completed successfully");
});
