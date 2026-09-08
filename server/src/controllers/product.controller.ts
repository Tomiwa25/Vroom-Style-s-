import { Request, Response } from "express";
import {
    getProducts,
    getProductById,
    searchProductsService,
} from "../services/product.service.js";

export const getProductsController = async (req: Request, res: Response) => {
    try {
        const limit = Number(req.query.limit) || 12;
        const skip = Number(req.query.skip) || 0;

        const result = await getProducts(limit, skip);
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

        if (Number.isNaN(productId)) {
            res.status(400).json({
                success: false,
                message: "Invalid Product ID",
            });
            return;
        }

        const product = await getProductById(productId);
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
        const limit = Number(req.query.limit) || 12;
        const skip = Number(req.query.skip) || 0;

        
        const result = await searchProductsService(query, limit, skip);

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

