import prisma from "../config/database.js";
import { ConflictError } from "../core/errors/app-error.js";

interface CreateOrderData {
    userId: string;
    total: number;
    items: {
        productId: string;
        quantity: number;
        price: number;
    }[];
    clearCart?: boolean;
    deliveryMethod?: "PAYSTACK" | "POD";
    shipping?: {
        name?: string;
        phone?: string;
        address?: string;
        city?: string;
        notes?: string;
    };
}

export const createOrder = async (data: CreateOrderData) => {
    return prisma.$transaction(async (tx) => {
        for (const item of data.items) {
            const updatedProduct = await tx.product.updateMany({
                where: {
                    id: item.productId,
                    stock: { gte: item.quantity },
                    isActive: true,
                },
                data: {
                    stock: { decrement: item.quantity },
                },
            });

            if (updatedProduct.count !== 1) {
                throw new ConflictError(
                    "Product stock changed while checking out. Please review your bag."
                );
            }
        }

        const order = await tx.order.create({
            data: {
                userId: data.userId,
                total: data.total,
                status: "PENDING",
                paymentStatus: "PENDING",
                deliveryMethod: data.deliveryMethod ?? "PAYSTACK",
                shippingName: data.shipping?.name,
                shippingPhone: data.shipping?.phone,
                shippingAddress: data.shipping?.address,
                shippingCity: data.shipping?.city,
                shippingNotes: data.shipping?.notes,
                items: {
                    create: data.items.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                },
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        if (data.clearCart) {
            await tx.cartItem.deleteMany({
                where: {
                    cart: { userId: data.userId },
                },
            });
        }

        return order;
    });
};

export const findOrdersByUserId = async (userId: string) => {
    return prisma.order.findMany({
        where: { userId },
        include: {
            items: {
                include: {
                    product: true,
                },
            },
            payment: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};

export const findOrderById = async (orderId: string) => {
    return prisma.order.findUnique({
        where: { id: orderId },
        include: {
            items: {
                include: {
                    product: true,
                },
            },
            payment: true,
            user: {
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                },
            },
        },
    });
};
