import prisma from "../config/database.js";
import { createOrder, findOrdersByUserId } from "../repositories/order.repository.js";
import { findCartForCheckout } from "../repositories/cart.repositories.js";

export const checkout = async (userId: string) => {
    const cart = await findCartForCheckout(userId);

    if(!cart) {
        throw new Error("Cart not found");
    }
    if (cart.items.length === 0) {
        throw new Error("Cart is empty")
    }
    const orderItems = cart.items.map((item) => {
        if(item.quantity <= 0) {
            throw new Error(`Invalid quantity for ${item.product.name}`);
        }
        if (item.quantity > item.product.stock) {
            throw new Error(`Insufficient stock for ${item.product.stock}`);
        }

        return {
            productId: item.product.id,
            quantity: item.quantity,
            price: Number(item.product.price),
        };
    });

    const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return createOrder({
        userId,
        total,
        items: orderItems,
    });

};

export const getUserOrders = async (
    userId: string
) => {
    return findOrdersByUserId(userId);
};

export const markOrderAsPaid = async (
    orderId: string,
) => {
    return prisma.order.update({
        where: {
            id: orderId
        },
        data: {
            paymentStatus: "PAID",
            status: "PROCESSING"
        },
    });
};