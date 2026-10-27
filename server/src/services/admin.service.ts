import {
    createProductForAdmin,
    findAllOrdersForAdmin,
    findProductsForAdmin,
    getAdminStoreStats as getAdminStatsFromRepository,
    updateOrderStatusForAdmin,
    updateProductForAdmin,
    updateProductStockForAdmin,
    countProductsForAdmin,
} from "../repositories/admin.repository.js";
import { deleteCachePattern } from "../lib/cache.js";

export const listAdminProducts = async (skip = 0, take = 50) => {
    const [products, total] = await Promise.all([
        findProductsForAdmin(skip, take),
        countProductsForAdmin(),
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
        take,
    };
};

export const createAdminProduct = async (data: {
    externalId?: number;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    stock: number;
}) => {
    const product = await createProductForAdmin(data);
    await deleteCachePattern("products:*");
    return product;
};

export const updateAdminProduct = async (
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
    const product = await updateProductForAdmin(productId, data);
    await deleteCachePattern("products:*");
    return product;
};

export const updateAdminProductStock = async (
    productId: string,
    stock: number
) => {
    const product = await updateProductStockForAdmin(productId, stock);
    await deleteCachePattern("products:*");
    return product;
};

export const getAllOrdersForAdmin = async () => {
    return findAllOrdersForAdmin();
};

export const updateAdminOrderStatus = async (
    orderId: string,
    status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED"
) => {
    return updateOrderStatusForAdmin(orderId, status);
};

export const getAdminStoreStats = async () => {
    return getAdminStatsFromRepository();
};
