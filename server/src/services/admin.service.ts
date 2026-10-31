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
import { sendOrderOutForDeliveryEmail } from "./email.service.js";

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
    const order = await updateOrderStatusForAdmin(orderId, status);

    // Domain Event: If order transitioned to SHIPPED, dispatch out-for-delivery notification email
    if (status === "SHIPPED" && (order as any).user?.email) {
        sendOrderOutForDeliveryEmail({
            to: (order as any).user.email,
            firstName: (order as any).user.firstName,
            orderId: order.id,
            carrier: "Vroom Express Courier",
            trackingNumber: `VRM-${order.id.slice(0, 8).toUpperCase()}`,
            deliveryDate: "3-7 business days",
        }).catch((err) =>
            console.error("Failed to send out for delivery notification email:", err)
        );
    }

    return order;
};

export const getAdminStoreStats = async () => {
    return getAdminStatsFromRepository();
};

