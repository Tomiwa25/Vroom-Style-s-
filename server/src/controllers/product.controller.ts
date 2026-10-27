import { Request, Response } from "express";
import {
    getProducts,
    getProductById,
    searchProductsService,
} from "../services/product.service.js";
import { getActiveCacheDriverName } from "../lib/cache.js";

export const getProductsController = async (req: Request, res: Response) => {
    try {
        const rawLimit = Number(req.query.limit);
        const rawSkip = Number(req.query.skip);

        // Security: Restrict pagination bounds to prevent memory denial-of-service
        const limit = Number.isInteger(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : 12;
        const skip = Number.isInteger(rawSkip) && rawSkip >= 0 ? rawSkip : 0;

        const result = await getProducts(limit, skip);

        res.setHeader("X-Cache-Driver", getActiveCacheDriverName());
        res.status(200).json({
            success: true,
            message: "All Product retrieve successfully",
            data: result,
        });
    } catch (error) {
        console.error("Failed to fetch products:", error);
        res.status(500).json({
            success: false,
            message: "Unable to fetch products",
        });
    }
};

export const getProductByIdController = async (req: Request, res: Response) => {
    try {
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
        res.status(200).json({
            success: true,
            data: product,
        });
    } catch (error) {
        console.error("Failed to fetch product by id:", error);
        res.status(404).json({
            success: false,
            message: "Product not found",
        });
    }
};

export const searchProductsController = async (req: Request, res: Response) => {
    try {
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
        res.status(200).json({
            success: true,
            message: "Products search completed successfully",
            data: result,
        });
    } catch (error) {
        console.error("Failed to search products:", error);
        res.status(500).json({
            success: false,
            message: "Unable to search products",
        });
    }
};
