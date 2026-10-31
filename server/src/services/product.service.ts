import {
    findProducts,
    countProducts,
    findProductByExternalId,
    searchProducts,
    countSearchProducts,
} from "../repositories/product.repositories.js";
import { getCache, setCache, deleteCachePattern } from "../lib/cache.js";
import type { Product } from "../types/product.js";
import { NotFoundError } from "../core/errors/app-error.js";

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

/**
 * Retrieves paginated catalog products with high-speed Redis / memory cache acceleration.
 */
export const getProducts = async (
    limit = 12,
    skip = 0
): Promise<{
    products: Product[];
    total: number;
    skip: number;
    limit: number;
}> => {
    const cacheKey = `products:all:${limit}:${skip}`;

    // 1. Attempt retrieval from cache layer
    const cached = await getCache<{
        products: Product[];
        total: number;
        skip: number;
        limit: number;
    }>(cacheKey);

    if (cached) {
        return cached;
    }

    // 2. Cache miss: Fetch directly from PostgreSQL
    const [products, total] = await Promise.all([
        findProducts(skip, limit),
        countProducts(),
    ]);

    const result = {
        products: products.map(mapProduct),
        total,
        skip,
        limit,
    };

    // 3. Persist to cache (TTL: 300 seconds / 5 minutes)
    await setCache(cacheKey, result, 300);

    return result;
};

/**
 * Retrieves a single product by externalId with caching.
 */
export const getProductById = async (id: number): Promise<Product> => {
    const cacheKey = `products:id:${id}`;

    const cached = await getCache<Product>(cacheKey);
    if (cached) {
        return cached;
    }

    const product = await findProductByExternalId(id);
    if (!product) {
        throw new NotFoundError("Product not found");
    }

    const result = mapProduct(product);

    // Cache for 10 minutes (600 seconds)
    await setCache(cacheKey, result, 600);

    return result;
};

/**
 * Searches products by query with caching.
 */
export const searchProductsService = async (
    query: string,
    limit = 12,
    skip = 0
) => {
    const normalizedQuery = query.trim().toLowerCase();
    const cacheKey = `products:search:${encodeURIComponent(normalizedQuery)}:${limit}:${skip}`;

    const cached = await getCache<{
        products: Product[];
        total: number;
        skip: number;
        limit: number;
    }>(cacheKey);

    if (cached) {
        return cached;
    }

    const [products, total] = await Promise.all([
        searchProducts(query, skip, limit),
        countSearchProducts(query),
    ]);

    const result = {
        products: products.map(mapProduct),
        total,
        skip,
        limit,
    };

    // Cache search results for 3 minutes (180 seconds)
    await setCache(cacheKey, result, 180);

    return result;
};

/**
 * Cache Invalidation: Clears all cached product lists and single queries.
 * Must be invoked whenever products or stock are created, modified, or deleted.
 */
export const invalidateProductCache = async (): Promise<void> => {
    await deleteCachePattern("products:*");
};
