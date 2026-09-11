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
        externalId?: number;
        name?: string;
        description?: string;
        price?: number;
        image?: string;
        category?: string;
        stock?: number;
    }
) => {
    const updateData: Prisma.ProductUpdateInput = {
        ...(data.name ? { name: data.name } : {}),
        ...(data.description ? { description: data.description } : {}),
        ...(data.image ? { image: data.image } : {}),
        ...(data.category ? { category: data.category } : {}),
        ...(data.stock !== undefined ? { stock: data.stock } : {}),
        ...(data.price !== undefined ? { price: new Prisma.Decimal(data.price) } : {}),
        ...(data.externalId !== undefined ? { externalId: data.externalId } : {}),
    };

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

export const findAllOrdersForAdmin = async () => {
    return prisma.order.findMany({
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
