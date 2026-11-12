import prisma from "../config/database.js";
import { Prisma } from "@prisma/client";

export const findProductsForAdmin = async (skip = 0, take = 50) => {
    return prisma.product.findMany({
        skip,
        take,
        orderBy: {
            createdAt: "desc",
        },
    });
};

export const countProductsForAdmin = async () => {
    return prisma.product.count();
};

export const createProductForAdmin = async (data: {
    externalId?: number;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    stock: number;
    isActive?: boolean;
}) => {
    return prisma.product.create({
        data: {
            ...data,
            price: new Prisma.Decimal(data.price),
        },
    });
};

export const updateProductForAdmin = async (
    productId: string,
    data: {
        externalId?: number | null;
        name?: string;
        description?: string;
        price?: number;
        image?: string;
        category?: string;
        stock?: number;
        isActive?: boolean;
    }
) => {
    // `!== undefined` (not truthiness): an admin editing a description
    // down to "" or toggling isActive to false must be persisted.
    const updateData: Prisma.ProductUpdateInput = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.stock !== undefined) updateData.stock = data.stock;
    if (data.price !== undefined) updateData.price = new Prisma.Decimal(data.price);
    if (data.externalId !== undefined) updateData.externalId = data.externalId;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    return prisma.product.update({
        where: {
            id: productId,
        },
        data: updateData,
    });
};

export const updateProductStockForAdmin = async (
    productId: string,
    stock: number
) => {
    return prisma.product.update({
        where: {
            id: productId,
        },
        data: {
            stock,
        },
    });
};

export const findAllOrdersForAdmin = async (skip = 0, take = 50) => {
    return prisma.order.findMany({
        skip,
        take,
        include: {
            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    role: true,
                },
            },
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

export const countOrdersForAdmin = async () => {
    return prisma.order.count();
};

export const findOrderForAdmin = async (orderId: string) => {
    return prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true, payment: true },
    });
};

export const updateOrderStatusForAdmin = async (
    orderId: string,
    status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED"
) => {
    return prisma.order.update({
        where: {
            id: orderId,
        },
        data: {
            status,
        },
        include: {
            user: {
                select: {
                    email: true,
                    firstName: true,
                    lastName: true,
                },
            },
        },
    });
};

export const getAdminStoreStats = async () => {
    const [
        totalProducts,
        totalOrders,
        totalCustomers,
        totalRevenue,
        lowStockProducts,
    ] = await Promise.all([
        prisma.product.count(),
        prisma.order.count(),
        prisma.user.count({
            where: {
                role: "CUSTOMER",
            },
        }),
        prisma.order.aggregate({
            _sum: {
                total: true,
            },
            where: {
                paymentStatus: "PAID",
            },
        }),
        prisma.product.count({
            where: {
                stock: {
                    lte: 5,
                },
            },
        }),
    ]);

    const statusCounts = await prisma.order.groupBy({
        by: ["status"],
        _count: {
            status: true,
        },
    });

    const paidOrders = await prisma.order.findMany({
        where: {
            paymentStatus: "PAID",
        },
        select: {
            id: true,
            total: true,
            status: true,
            createdAt: true,
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 5,
    });

    return {
        totalProducts,
        totalOrders,
        totalCustomers,
        totalRevenue: Number(totalRevenue._sum.total ?? 0),
        lowStockProducts,
        latestPaidOrders: paidOrders.map((order) => ({
            id: order.id,
            total: Number(order.total),
            status: order.status,
            createdAt: order.createdAt,
        })),
        orderStatusCounts: statusCounts.map((entry) => ({
            status: entry.status,
            count: entry._count.status,
        })),
    };
};
