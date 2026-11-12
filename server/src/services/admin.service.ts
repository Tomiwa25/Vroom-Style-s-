import {
    createProductForAdmin,
    findAllOrdersForAdmin,
    countOrdersForAdmin,
    findProductsForAdmin,
    findOrderForAdmin,
    getAdminStoreStats as getAdminStatsFromRepository,
    updateOrderStatusForAdmin,
    updateProductForAdmin,
    updateProductStockForAdmin,
    countProductsForAdmin,
} from "../repositories/admin.repository.js";
import { deleteCachePattern } from "../lib/cache.js";
import { sendOrderOutForDeliveryEmail } from "./email.service.js";
import { cancelOrderAndReleaseStock } from "./order.service.js";
import {
    BadRequestError,
    ConflictError,
    NotFoundError,
} from "../core/errors/app-error.js";

type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

/**
 * Valid order-status transitions. Terminal states (CANCELLED / DELIVERED)
 * can't be left. PENDING → SHIPPED is allowed because some POD flows despatch
 * without an intermediate processing step.
 */
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    PENDING: ["PROCESSING", "SHIPPED", "CANCELLED"],
    PROCESSING: ["SHIPPED", "CANCELLED"],
    SHIPPED: ["DELIVERED", "CANCELLED"],
    DELIVERED: [],
    CANCELLED: [],
};

const assertTransition = (from: OrderStatus, to: OrderStatus): void => {
    if (from === to) return;
    if (!ALLOWED_TRANSITIONS[from].includes(to)) {
        throw new BadRequestError(
            `Cannot change order status from ${from} to ${to}.`
        );
    }
};

export const listAdminProducts = async (skip = 0, take = 50) => {
    const effectiveTake = Math.min(Math.max(take, 1), 200);
    const effectiveSkip = Math.max(skip, 0);

    const [products, total] = await Promise.all([
        findProductsForAdmin(effectiveSkip, effectiveTake),
        countProductsForAdmin(),
    ]);

    return {
        products: products.map((product) => ({
            id: product.id,
            externalId: product.externalId ?? null,
            name: product.name,
            description: product.description,
            price: Number(product.price),
            image: product.image,
            category: product.category,
            stock: product.stock,
            isActive: product.isActive,
        })),
        total,
        skip: effectiveSkip,
        take: effectiveTake,
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
    isActive?: boolean;
}) => {
    const product = await createProductForAdmin(data);
    await deleteCachePattern("products:*");
    return product;
};

export const updateAdminProduct = async (
    productId: string,
    data: {
        externalId?: number | null;
        name?: string;
        description?: string;
        price?: number;
        image?: string;
        category?: string;
        stock?: number;
        isActive?: boolean;
    }
) => {
    try {
        const product = await updateProductForAdmin(productId, data);
        await deleteCachePattern("products:*");
        return product;
    } catch (err: any) {
        if (err?.code === "P2025") {
            throw new NotFoundError("Product not found");
        }
        if (err?.code === "P2002") {
            throw new ConflictError("Another product already uses that externalId.");
        }
        throw err;
    }
};

export const updateAdminProductStock = async (
    productId: string,
    stock: number
) => {
    try {
        const product = await updateProductStockForAdmin(productId, stock);
        await deleteCachePattern("products:*");
        return product;
    } catch (err: any) {
        if (err?.code === "P2025") {
            throw new NotFoundError("Product not found");
        }
        throw err;
    }
};

export const getAllOrdersForAdmin = async (skip = 0, take = 50) => {
    const effectiveTake = Math.min(Math.max(take, 1), 200);
    const effectiveSkip = Math.max(skip, 0);

    const [orders, total] = await Promise.all([
        findAllOrdersForAdmin(effectiveSkip, effectiveTake),
        countOrdersForAdmin(),
    ]);

    return { orders, total, skip: effectiveSkip, take: effectiveTake };
};

export const updateAdminOrderStatus = async (
    orderId: string,
    status: OrderStatus
) => {
    const existing = await findOrderForAdmin(orderId);
    if (!existing) {
        throw new NotFoundError("Order not found");
    }

    assertTransition(existing.status as OrderStatus, status);

    // Cancelling releases reserved stock exactly once. That helper is
    // idempotent via `stockReleasedAt`, so a second cancel click is harmless.
    if (status === "CANCELLED" && existing.status !== "CANCELLED") {
        await cancelOrderAndReleaseStock(orderId, "admin cancelled");
        const cancelled = await updateOrderStatusForAdmin(orderId, status);
        return cancelled;
    }

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
