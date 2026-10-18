import {
    findProducts,
    countProducts,
    findProductByExternalId,
    searchProducts,
    countSearchProducts,
} from "../repositories/product.repositories.js";
import type { Product } from "../types/product.js";

const mapProduct = (p: any): Product => ({
    id: p.id,
    externalId: p.externalId ?? 0,
    name: p.name,
    description: p.description,
    price: Number(p.price),
    image: p.image,
    images: p.images ?? [p.image],
    category: p.category,
    stock: p.stock,
    tag: p.tag ?? null,
    sizes: p.sizes ?? [],
    colors: p.colors ?? null,
    material: p.material ?? null,
    fitGuide: p.fitGuide ?? null,
});

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
        products: products.map(mapProduct),
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

    return mapProduct(product);
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
        products: products.map(mapProduct),
        total,
        skip,
        limit,
    };
};
