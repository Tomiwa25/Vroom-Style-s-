import prisma from "../config/database";

export const findProducts = async (
    skip: number,
    take: number
) => {
    return prisma.product.findMany({
        where: {
            isActive: true
        },
        skip,
        take,
        orderBy: {
            createdAt: "desc"
        },
    });
};

export const countProducts = async () => {
    return prisma.product.count({
         where: {
            isActive: true
        },
    });
};

export const findProductById = async (id: string) => {
    return prisma.product.findUnique({
        where: {
            id,
            isActive: true
        },
    });
};

export const findProductByExternalId = async (
    externalId: number
) => {
    return prisma.product.findUnique({
        where: {
            externalId
        },
    });
};

export const searchProducts = async (
    query: string,
    skip: number,
    take: number
) => {
    return prisma.product.findMany({
        where: {
            isActive: true,
            OR: [
                {
                    name: {
                        contains: query,
                        mode: "insensitive"
                    },
                },
                {
                    description: {
                        contains: query,
                        mode: "insensitive"
                    },
                },
            ],
        },
        skip,
        take,
        orderBy: {
            createdAt: "desc"
        },
    });
};

export const countSearchProducts = async (
    query: string
) => {
    return prisma.product.count({
        where: {
            isActive: true,
            OR: [
                {
                    name: {
                        contains: query,
                        mode: "insensitive"
                    },
                },
                {
                    description: {
                        contains: query,
                        mode: "insensitive"
                    },
                },
            ],
        },
    });
};