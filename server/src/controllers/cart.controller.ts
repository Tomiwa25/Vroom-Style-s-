import { Request, Response } from "express";
import {
    addProductToCart,
    getCart,
    updateCartQuantity,
    removeCartItem,
} from "../services/cart.service.js";
import { getAuthUser } from "../middleware/auth.middleware.js";
import { ApiResponse } from "../core/http/api-response.js";
import { asyncHandler } from "../core/http/async-handler.js";

/**
 * HTTP Adapter Controller for Cart.
 * Unpacks validated request data from Gateway perimeter and invokes CartService.
 */
export const getCartController = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const cart = await getCart(user.userId);

    return ApiResponse.success(res, cart, "Cart retrieved successfully");
});

export const addCartItemController = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const { productId, quantity } = req.body;
    const item = await addProductToCart(user.userId, productId, quantity);

    return ApiResponse.created(res, item, "Item added to cart successfully");
});

export const updateCartQuantityController = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const rawId = req.params.id;
    const cartItemId = Array.isArray(rawId) ? rawId[0] : rawId;
    const { quantity } = req.body;

    const item = await updateCartQuantity(user.userId, cartItemId, quantity);

    return ApiResponse.success(res, item, "Cart item quantity updated successfully");
});

export const removeCartItemController = asyncHandler(async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const rawId = req.params.id;
    const cartItemId = Array.isArray(rawId) ? rawId[0] : rawId;

    const result = await removeCartItem(user.userId, cartItemId);

    return ApiResponse.success(res, result, "Cart item removed successfully");
});