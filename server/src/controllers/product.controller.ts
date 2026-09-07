import { Request, Response } from "express";
import { getProducts } from "../services/external/product.service";

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
}