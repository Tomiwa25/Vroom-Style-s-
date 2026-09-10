import prisma from "../config/database.js";

export const findCartByUserId = async (userId: string) => {
    return prisma.cart.findUnique({
        where: {
            userId
        },
        include: {
            items: {
                include: {
                    product: true,
                },
            },
        },
    });
};

export const createCart = async (userId: string) => {
    return prisma.cart.create({
        data: {
            userId
        },
        include: {
            items: {
                include: {
                    product: true,
                },
            },
        },
    });
};

export const findCartItem = async (
    cartId: string,
    productId: string
) => {
    return prisma.cartItem.findUnique({
        where: {
            cartId_productId: {
                cartId,
                productId
            },
        },
    });
};

export const addCartItem = async (
    cartId: string,
    productId: string,
    quantity: number
) => {
    return prisma.cartItem.create({
        data: {
            cartId,
            productId,
            quantity
        },
        include: {
            product: true,
        },
    });
};

export const findCartForCheckout = async (userId: string) => {
    const cart = await prisma.cart.findUnique({
        where: {
            userId,
        },
        include: {
            items: {
                include: {
                    product: true,
                },
            },
        },
    });

    if (!cart) {
        throw new Error("Cart not found");
    }

    for (const item of cart.items) {
        if (item.quantity > item.product.stock) {
            throw new Error(`Insufficient stock for ${item.product.name}`);
        }
    }

    return cart;
};

export const updateCartItem = async (
    cartItemId: string,
    quantity: number
) => {
    return prisma.cartItem.update({
        where: {
            id: cartItemId,
        },
        data: {
            quantity
        },
        include: {
            product: true
        },
    });
};

export const deleteCartItem = async (
    cartItemId: string
) => {
    return prisma.cartItem.delete({
        where: {
            id: cartItemId
        },
    });
};