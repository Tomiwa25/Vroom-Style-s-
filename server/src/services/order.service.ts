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

export const getOrderTracking = async (
    orderId: string,
    userId: string,
    isAdmin = false
) => {
    const { findOrderById } = await import("../repositories/order.repository.js");
    const order = await findOrderById(orderId);
    if (!order) {
        throw new Error("Order not found with provided ID");
    }

    if (order.userId !== userId && !isAdmin) {
        throw new Error("You are not authorized to track this order");
    }

    const status = order.status;
    const isCancelled = status === "CANCELLED";
    const isPlaced = true;
    const isPackaged = status === "PROCESSING" || status === "SHIPPED" || status === "DELIVERED";
    const isOnDelivery = status === "SHIPPED" || status === "DELIVERED";
    const isDelivered = status === "DELIVERED";

    const milestones = [
        {
            key: "PLACED",
            title: "Order Placed",
            description: "Confirmed and logged in atelier queue.",
            completed: isPlaced,
            current: status === "PENDING",
            timestamp: order.createdAt,
        },
        {
            key: "PACKAGED",
            title: "Order Packaged",
            description: "Bespoke packaging and artisan quality inspection completed.",
            completed: isPackaged,
            current: status === "PROCESSING",
        },
        {
            key: "ON_DELIVERY",
            title: "Order on Delivery",
            description: "In transit with courier to destination.",
            completed: isOnDelivery,
            current: status === "SHIPPED",
        },
        {
            key: "BEING_DELIVERED",
            title: "Order Being Delivered",
            description: "Courier in final approach. Delivery arrival email notification dispatched.",
            completed: isDelivered,
            current: status === "SHIPPED",
        },
        {
            key: "DELIVERED",
            title: "Delivered",
            description: "Signed and received by patron.",
            completed: isDelivered,
            current: status === "DELIVERED",
        },
    ];

    return {
        id: order.id,
        status: order.status,
        paymentStatus: order.paymentStatus,
        total: Number(order.total),
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        milestones,
        isCancelled,
        items: order.items.map((item) => ({
            id: item.id,
            productName: item.product.name,
            productImage: item.product.image,
            quantity: item.quantity,
            price: Number(item.price),
        })),
        customerName: `${order.user.firstName} ${order.user.lastName}`,
        carrier: "Vroom Express Courier",
        estimatedDelivery: "24-48 hours nationwide",
    };
};