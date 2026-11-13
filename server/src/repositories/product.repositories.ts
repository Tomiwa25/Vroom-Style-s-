import prisma from "../config/database.js";
import type { Prisma } from "@prisma/client";

export interface ProductListFilter {
    category?: string;
    query?: string;
    brand?: string;
    isDemo?: boolean;
    sellerType?: string;
}

const buildWhere = (
    filter: ProductListFilter = {}
): Prisma.ProductWhereInput => {
    const where: Prisma.ProductWhereInput = { isActive: true };

    if (filter.category && filter.category !== "All") {
        where.category = { equals: filter.category, mode: "insensitive" };
    }

    if (filter.brand) {
        where.brand = { equals: filter.brand, mode: "insensitive" };
    }

    if (filter.sellerType) {
        where.sellerType = { equals: filter.sellerType, mode: "insensitive" };
    }

    if (filter.isDemo !== undefined) {
        where.isDemo = filter.isDemo;
    }

    if (filter.query) {
        where.OR = [
            { name: { contains: filter.query, mode: "insensitive" } },
            { description: { contains: filter.query, mode: "insensitive" } },
            { category: { contains: filter.query, mode: "insensitive" } },
            { subcategory: { contains: filter.query, mode: "insensitive" } },
            { brand: { contains: filter.query, mode: "insensitive" } },
            { sku: { contains: filter.query, mode: "insensitive" } },
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

export const findProductBySlug = async (slug: string) => {
    return prisma.product.findFirst({
        where: { slug, isActive: true },
    });
};

export const findProductBySku = async (sku: string) => {
    return prisma.product.findFirst({
        where: { sku, isActive: true },
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
