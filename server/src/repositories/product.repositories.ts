import prisma from "../config/database.js";
import type { Prisma } from "@prisma/client";

export interface ProductListFilter {
    category?: string;
    query?: string;
}

const buildWhere = (
    filter: ProductListFilter = {}
): Prisma.ProductWhereInput => {
    const where: Prisma.ProductWhereInput = { isActive: true };

    if (filter.category && filter.category !== "All") {
        where.category = { equals: filter.category, mode: "insensitive" };
    }

    if (filter.query) {
        where.OR = [
            { name: { contains: filter.query, mode: "insensitive" } },
            { description: { contains: filter.query, mode: "insensitive" } },
            { category: { contains: filter.query, mode: "insensitive" } },
        ];
    }

    return where;
};

export const findProducts = async (
    skip: number,
    take: number,
    filter: ProductListFilter = {}
) => {
    return prisma.product.findMany({
        where: buildWhere(filter),
        skip,
        take,
        orderBy: { createdAt: "desc" },
    });
};

export const countProducts = async (filter: ProductListFilter = {}) => {
    return prisma.product.count({ where: buildWhere(filter) });
};

export const findProductByUuid = async (id: string) => {
    return prisma.product.findFirst({
        where: { id, isActive: true },
    });
};

export const findProductByExternalId = async (externalId: number) => {
    return prisma.product.findFirst({
        where: { externalId, isActive: true },
    });
};

export const searchProducts = async (
    query: string,
    skip: number,
    take: number,
    filter: ProductListFilter = {}
) => {
    return findProducts(skip, take, { ...filter, query });
};

export const countSearchProducts = async (
    query: string,
    filter: ProductListFilter = {}
) => {
    return countProducts({ ...filter, query });
};
