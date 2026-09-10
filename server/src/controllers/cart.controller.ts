import { Request, Response } from "express";
import {
    addProductToCart,
    getCart,
    updateCartQuantity,
    removeCartItem,
} from "../services/cart.service.js";

export const getCartController = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: "Authentication required",
            });
            return;
        }

        const cart = await getCart(req.user.userId);

        res.status(200).json({
            success: true,
            message: "Cart retrieved successfully",
            data: cart,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Unable to retrieve cart",
        });
    }
};

export const addCartItemController = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: "Authentication required",
            });
            return;
        }

        const { productId, quantity } = req.body;

        if (typeof productId !== "string" || typeof quantity !== "number") {
            res.status(400).json({
                success: false,
                message: "Product ID and quantity are required",
            });
            return;
        }

        const item = await addProductToCart(req.user.userId, productId, quantity);

        res.status(201).json({
            success: true,
            message: "Item added to cart successfully",
            data: item,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Unable to add item to cart",
        });
    }
};

export const updateCartQuantityController = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: "Authentication required",
            });
            return;
        }

        const rawId = req.params.id;
        const id = Array.isArray(rawId) ? rawId[0] : rawId;

        if (!id) {
            res.status(400).json({
                success: false,
                message: "Cart item ID is required",
            });
            return;
        }
        const { quantity } = req.body;

        if (typeof quantity !== "number") {
            res.status(400).json({
                success: false,
                message: "Quantity is required",
            });
            return;
        }

        const item = await updateCartQuantity(req.user.userId, id, quantity);

        res.status(200).json({
            success: true,
            message: "Cart item quantity updated successfully",
            data: item,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Unable to update cart item",
        });
    }
};

export const removeCartItemController = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: "Authentication required",
            });
            return;
        }

        const rawId = req.params.id;
        const cartItemId = Array.isArray(rawId) ? rawId[0] : rawId;

        if (!cartItemId) {
            res.status(400).json({
                success: false,
                message: "Cart item ID is required",
            });
            return;
        }

        const result = await removeCartItem(req.user.userId, cartItemId);

        res.status(200).json({
            success: true,
            message: "Cart item removed successfully",
            data: result,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Unable to remove cart item",
        });
    }
};