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
import {
    createProductSchema,
    updateOrderStatusSchema,
    updateProductSchema,
    updateStockSchema,
} from "../validators/admin.validator.js";

export const listAdminProductsController = async (req: Request, res: Response) => {
    try {
        const skip = Number(req.query.skip) || 0;
        const take = Number(req.query.take) || 50;

        const result = await listAdminProducts(skip, take);
        res.status(200).json({
            success: true,
            message: "Admin products retrieved successfully",
            data: result,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Unable to retrieve products",
        });
    }
};

export const createAdminProductController = async (req: Request, res: Response) => {
    try {
        const payload = createProductSchema.parse(req.body);
        const product = await createAdminProduct(payload);

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: product,
        });
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({
                success: false,
                message: error.message,
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: "Unable to create product",
        });
    }
};

export const updateAdminProductController = async (req: Request, res: Response) => {
    try {
        const rawId = req.params.id;
        const productId = Array.isArray(rawId) ? rawId[0] : rawId;

        if (!productId) {
            res.status(400).json({
                success: false,
                message: "Product ID is required",
            });
            return;
        }

        const payload = updateProductSchema.parse(req.body);

        const product = await updateAdminProduct(productId, payload);

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: product,
        });
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({
                success: false,
                message: error.message,
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: "Unable to update product",
        });
    }
};

export const updateAdminStockController = async (req: Request, res: Response) => {
    try {
        const rawId = req.params.id;
        const productId = Array.isArray(rawId) ? rawId[0] : rawId;

        if (!productId) {
            res.status(400).json({
                success: false,
                message: "Product ID is required",
            });
            return;
        }

        const payload = updateStockSchema.parse(req.body);

        const product = await updateAdminProductStock(productId, payload.stock);

        res.status(200).json({
            success: true,
            message: "Stock updated successfully",
            data: product,
        });
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({
                success: false,
                message: error.message,
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: "Unable to update stock",
        });
    }
};

export const getAdminOrdersController = async (_req: Request, res: Response) => {
    try {
        const orders = await getAllOrdersForAdmin();

        res.status(200).json({
            success: true,
            message: "All customer orders retrieved successfully",
            data: orders,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Unable to retrieve orders",
        });
    }
};

export const updateAdminOrderStatusController = async (req: Request, res: Response) => {
    try {
        const rawId = req.params.id;
        const orderId = Array.isArray(rawId) ? rawId[0] : rawId;

        if (!orderId) {
            res.status(400).json({
                success: false,
                message: "Order ID is required",
            });
            return;
        }

        const payload = updateOrderStatusSchema.parse(req.body);

        const order = await updateAdminOrderStatus(orderId, payload.status);

        res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            data: order,
        });
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({
                success: false,
                message: error.message,
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: "Unable to update order status",
        });
    }
};

export const getAdminStoreStatsController = async (_req: Request, res: Response) => {
    try {
        const stats = await getAdminStoreStats();

        res.status(200).json({
            success: true,
            message: "Store statistics retrieved successfully",
            data: stats,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Unable to retrieve store statistics",
        });
    }
};
