import {
    findProducts,
    countProducts,
    findProductByExternalId,
    searchProducts,
    countSearchProducts,
} from "../repositories/product.repositories.js";
import type { Product } from "../types/product.js";

export const getProducts = async (
    limit = 12,
    skip = 0
): Promise<{
    products: Product[];
    total: number;
    skip: number;
    limit: number;
}> => {
    const [products, total] = await Promise.all([
        findProducts(skip, limit),
        countProducts(),
    ]);

    return {
        products: products.map((product) => ({
            id: product.id,
            externalId: product.externalId ?? 0,
            name: product.name,
            description: product.description,
            price: Number(product.price),
            image: product.image,
            category: product.category,
            stock: product.stock,
        })),
        total,
        skip,
        limit,
    };
};

export const getProductById = async (id: number): Promise<Product> => {
    const product = await findProductByExternalId(id);

    if (!product) {
        throw new Error("Product not found");
    }

    return {
        id: product.id,
        externalId: product.externalId ?? 0,
        name: product.name,
        description: product.description,
        price: Number(product.price),
        image: product.image,
        category: product.category,
        stock: product.stock,
    };
};

export const searchProductsService = async (
    query: string,
    limit = 12,
    skip = 0
) => {
    const [products, total] = await Promise.all([
        searchProducts(query, skip, limit),
        countSearchProducts(query),
    ]);
    return {
        products,
        total,
        skip,
        limit,
    };
};
