import {
    findCartByUserId,
    createCart,
    findCartItem,
    addCartItem,
    updateCartItem,
    deleteCartItem,
} from "../repositories/cart.repositories.js";
import prisma from "../config/database.js";
import { BadRequestError, NotFoundError } from "../core/errors/app-error.js";

export const getOrCreateCart = async (userId: string) => {
    let cart = await findCartByUserId(userId);

    if (!cart) {
        // Race-safe creation: two concurrent requests for the same user
        // would both try to insert; catch the unique violation and re-read.
        try {
            cart = await createCart(userId);
        } catch (err: any) {
            if (err?.code === "P2002") {
                cart = await findCartByUserId(userId);
            } else {
                throw err;
            }
        }
    }

    if (!cart) {
        // Should not happen, but never return undefined.
        cart = await createCart(userId);
    }

    return cart;
};

export const addProductToCart = async (
    userId: string,
    productId: string,
    quantity: number
) => {
    const product = await prisma.product.findUnique({
        where: { id: productId },
    });

    if (!product || !product.isActive) {
        throw new NotFoundError("Product not found");
    }
    if (product.stock < quantity) {
        throw new BadRequestError("Insufficient stock");
    }

    const cart = await getOrCreateCart(userId);

    const existingItem = await findCartItem(cart.id, productId);

    if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stock) {
            throw new BadRequestError(
                `You already have ${existingItem.quantity} in your bag. Only ${product.stock} available.`
            );
        }
        return updateCartItem(existingItem.id, newQuantity);
    }
    return addCartItem(cart.id, productId, quantity);
};

export const getCart = async (userId: string) => {
    const cart = await getOrCreateCart(userId);
    const items = cart.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        product: {
            id: item.product.id,
            name: item.product.name,
            price: Number(item.product.price),
            image: item.product.image,
            stock: item.product.stock,
        },
        itemTotal: Number(item.product.price) * item.quantity,
    }));

    const subtotal = items.reduce((total, item) => total + item.itemTotal, 0);

    const totalItems = items.reduce((total, item) => total + item.quantity, 0);

    return {
        id: cart.id,
        items,
        subtotal,
        totalItems,
    };
};

export const updateCartQuantity = async (
    userId: string,
    cartItemId: string,
    quantity: number
) => {
    const cart = await getOrCreateCart(userId);
    const item = await prisma.cartItem.findFirst({
        where: {
            id: cartItemId,
            cartId: cart.id,
        },
        include: {
            product: true,
        },
    });

    if (!item) {
        throw new NotFoundError("Cart item not found");
    }
    if (!item.product.isActive) {
        throw new BadRequestError("This product is no longer available.");
    }
    if (quantity > item.product.stock) {
        throw new BadRequestError(
            `Insufficient stock. Only ${item.product.stock} available.`
        );
    }

    return updateCartItem(cartItemId, quantity);
};

export const removeCartItem = async (
    userId: string,
    cartItemId: string
) => {
    const cart = await getOrCreateCart(userId);

    const item = await prisma.cartItem.findFirst({
        where: {
            id: cartItemId,
            cartId: cart.id,
        },
    });

    if (!item) {
        throw new NotFoundError("Cart item not found");
    }

    await deleteCartItem(cartItemId);

    return {
        message: "Item removed from cart",
    };
};
