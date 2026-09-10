import prisma from "../config/database.js";

export const createOrder = async (data: {
    userId: string;
    total: number;
    items: {
        productId: string;
        quantity: number;
        price: number;
    }[];
}) => {
    return prisma.$transaction (async (tx) => {
        for (const item of data.items) {
            const updatedProduct = await tx.product.updateMany({
                where: {
                    id: item.productId,
                    stock: {
                        gte: item.quantity,
                    },
                },
                data: {
                    stock: {
                        decrement: item.quantity
                    },
                },
            });

            if (updatedProduct.count !== 1) {
                throw new Error("Product stock changed. Please review your cart.");
            }
        }
        const order = await tx.order.create({
            data: {
                userId: data.userId,
                total: data.total,
                status: "PENDING",
                paymentStatus: "PENDING",
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

        await tx.cartItem.deleteMany({
            where: {
                cart:  {
                    userId: data.userId,
                },
            },
        });
        return order;
  });
};

export const findOrdersByUserId = async (
    userId: string
) => {
    return prisma.order.findMany({
        where: {
            userId,
        },
        include: {
            items: {
                include: {
                    product: true,
                },
            },
            payment: true,
        },
        orderBy: {
            createdAt: "desc"
        },
    });
};
