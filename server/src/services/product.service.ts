import {
    findProducts,
    countProducts,
    findProductByExternalId,
    findProductByUuid,
    searchProducts,
    countSearchProducts,
    type ProductListFilter,
} from "../repositories/product.repositories.js";
import { getCache, setCache, deleteCachePattern } from "../lib/cache.js";
import type { Product } from "../types/product.js";
import { NotFoundError } from "../core/errors/app-error.js";

export const MAX_PRODUCT_PAGE_SIZE = 200;

const mapProduct = (p: any): Product => ({
    id: p.id,
    externalId: p.externalId ?? null,
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
    sellerType: p.sellerType ?? "1P",
    sellerName: p.sellerName ?? "Vroom Direct",
    sellerRating: p.sellerRating ?? 100,
    isFulfilledByVroom: p.isFulfilledByVroom ?? true,
    warranty: p.warranty,
    bundledIncentive: p.bundledIncentive,
    isPodEligible: p.isPodEligible ?? true,
    podTerms: p.podTerms ?? "Pay upon doorstep delivery via POS or cash in Lagos, Abuja & PH.",
});

const normalizeFilter = (filter: ProductListFilter = {}): ProductListFilter => ({
    category: filter.category && filter.category !== "All" ? filter.category : undefined,
    query: filter.query?.trim() || undefined,
});

/**
 * Retrieves paginated catalog products with cache acceleration.
 * Supports optional category and free-text query filters.
 */
export const getProducts = async (
    limit = 12,
    skip = 0,
    filter: ProductListFilter = {}
): Promise<{
    products: Product[];
    total: number;
    skip: number;
    limit: number;
}> => {
    const effectiveLimit = Math.min(Math.max(limit, 1), MAX_PRODUCT_PAGE_SIZE);
    const safeSkip = Math.max(skip, 0);
    const f = normalizeFilter(filter);

    const cacheKey = `products:all:${f.category ?? "*"}:${f.query ?? "*"}:${effectiveLimit}:${safeSkip}`;

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
        findProducts(safeSkip, effectiveLimit, f),
        countProducts(f),
    ]);

    const result = {
        products: products.map(mapProduct),
        total,
        skip: safeSkip,
        limit: effectiveLimit,
    };

    await setCache(cacheKey, result, 300);

    return result;
};

/**
 * Retrieves a single product by its database UUID.
 */
export const getProductByUuid = async (id: string): Promise<Product> => {
    const cacheKey = `products:uuid:${id}`;

    const cached = await getCache<Product>(cacheKey);
    if (cached) {
        return cached;
    }

    const product = await findProductByUuid(id);
    if (!product) {
        throw new NotFoundError("Product not found");
    }

    const result = mapProduct(product);
    await setCache(cacheKey, result, 600);
    return result;
};

/**
 * Retrieves a single product by its numeric external (legacy) id.
 */
export const getProductByExternalId = async (id: number): Promise<Product> => {
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
    await setCache(cacheKey, result, 600);
    return result;
};

/**
 * Searches products by query with caching.
 */
export const searchProductsService = async (
    query: string,
    limit = 12,
    skip = 0,
    filter: ProductListFilter = {}
) => {
    const effectiveLimit = Math.min(Math.max(limit, 1), MAX_PRODUCT_PAGE_SIZE);
    const safeSkip = Math.max(skip, 0);
    const normalizedQuery = query.trim();
    const f = normalizeFilter({ ...filter });

    const cacheKey = `products:search:${encodeURIComponent(normalizedQuery)}:${f.category ?? "*"}:${effectiveLimit}:${safeSkip}`;

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
        searchProducts(normalizedQuery, safeSkip, effectiveLimit, f),
        countSearchProducts(normalizedQuery, f),
    ]);

    const result = {
        products: products.map(mapProduct),
        total,
        skip: safeSkip,
        limit: effectiveLimit,
    };

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
