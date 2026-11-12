import prisma from "../config/database.js";
import {
    createOrder,
    findOrderById,
    findOrdersByUserId,
} from "../repositories/order.repository.js";
import { findCartForCheckout } from "../repositories/cart.repositories.js";
import {
    BadRequestError,
    ConflictError,
    NotFoundError,
} from "../core/errors/app-error.js";

/**
 * How long an unpaid PENDING order holds its reserved stock.
 * After this window the sweep cancels the order and returns stock.
 */
export const UNPAID_ORDER_TTL_MINUTES = Number(
    process.env.UNPAID_ORDER_TTL_MINUTES ?? 30
);

export type DeliveryMethod = "PAYSTACK" | "POD";

export interface CheckoutShipping {
    name?: string;
    phone?: string;
    address?: string;
    city?: string;
    notes?: string;
}

interface CheckoutRequest {
    source: "cart" | "items";
    items?: { productId?: string; externalId?: number; quantity: number }[];
    deliveryMethod: DeliveryMethod;
    shipping?: CheckoutShipping;
}

export const checkout = async (userId: string, request: CheckoutRequest) => {
    const { source, deliveryMethod, shipping } = request;

    let orderItems: { productId: string; quantity: number; price: number }[];
    let clearCart = false;

    if (source === "items") {
        const items = request.items ?? [];
        if (items.length === 0) {
            throw new BadRequestError("At least one item is required.");
        }

        // Resolve all products in one query, filtered to active catalog
        // so disabled products can't be bought by hitting the API directly.
        const ids = items.map((i) => i.productId).filter(Boolean) as string[];
        const extIds = items
            .map((i) => i.externalId)
            .filter((x): x is number => typeof x === "number");

        const products = await prisma.product.findMany({
            where: { isActive: true, OR: [{ id: { in: ids } }, { externalId: { in: extIds } }] },
        });
        const byId = new Map(products.map((p) => [p.id, p]));
        const byExt = new Map(
            products
                .filter((p) => p.externalId !== null)
                .map((p) => [p.externalId as number, p])
        );

        orderItems = items.map((item) => {
            if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
                throw new BadRequestError("Invalid quantity in order items.");
            }
            const product =
                (item.productId && byId.get(item.productId)) ||
                (typeof item.externalId === "number" && byExt.get(item.externalId));
            if (!product) {
                throw new NotFoundError("One or more selected products could not be found.");
            }
            if (item.quantity > product.stock) {
                throw new ConflictError(
                    `Insufficient stock for ${product.name} (only ${product.stock} available).`
                );
            }
            return {
                productId: product.id,
                quantity: item.quantity,
                price: Number(product.price),
            };
        });
    } else {
        const cart = await findCartForCheckout(userId);
        if (!cart) {
            throw new NotFoundError("Cart not found");
        }
        if (cart.items.length === 0) {
            throw new BadRequestError("Your bag is empty.");
        }

        const inactive = cart.items.find((i) => !i.product.isActive);
        if (inactive) {
            throw new BadRequestError(
                `${inactive.product.name} is no longer available. Please remove it from your bag.`
            );
        }

        orderItems = cart.items.map((item) => {
            if (item.quantity <= 0) {
                throw new BadRequestError(`Invalid quantity for ${item.product.name}`);
            }
            if (item.quantity > item.product.stock) {
                throw new ConflictError(
                    `Insufficient stock for ${item.product.name} (only ${item.product.stock} available).`
                );
            }
            return {
                productId: item.product.id,
                quantity: item.quantity,
                price: Number(item.product.price),
            };
        });
        clearCart = true;
    }

    const total = orderItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    return createOrder({
        userId,
        total,
        items: orderItems,
        clearCart,
        deliveryMethod,
        shipping,
    });
};

export const getUserOrders = async (userId: string) => {
    return findOrdersByUserId(userId);
};

/**
 * Mark an order as paid. Idempotent when called twice with the same payment.
 * Runs payment + order updates inside one transaction so a crash cannot
 * leave payment=PAID/order=PENDING or vice versa.
 */
export const markOrderAsPaid = async (orderId: string) => {
    return prisma.$transaction(async (tx) => {
        await tx.payment.updateMany({
            where: { orderId, status: { not: "PAID" } },
            data: { status: "PAID", paidAt: new Date() },
        });
        return tx.order.updateMany({
            where: {
                id: orderId,
                paymentStatus: { not: "PAID" },
                status: { not: "CANCELLED" },
            },
            data: {
                paymentStatus: "PAID",
                status: "PROCESSING",
            },
        });
    });
};

/**
 * Return reserved stock for an order and mark it CANCELLED.
 * Idempotent: uses `stockReleasedAt` as a fence so a second call (admin
 * clicking cancel twice, or expiry sweep racing an admin cancel) does not
 * add inventory back twice.
 */
export const cancelOrderAndReleaseStock = async (
    orderId: string,
    reason?: string
): Promise<boolean> => {
    return prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
            where: { id: orderId },
            include: { items: true },
        });

        if (!order) {
            throw new NotFoundError("Order not found");
        }
        if (order.paymentStatus === "PAID") {
            throw new BadRequestError(
                "Paid orders cannot be cancelled automatically. Issue a refund manually."
            );
        }
        if (order.stockReleasedAt) {
            // Already released (or already cancelled). Nothing to do.
            return false;
        }

        // Fence the row: only the caller that sees a null `stockReleasedAt`
        // and successfully sets it proceeds to touch inventory.
        const fenced = await tx.order.updateMany({
            where: { id: orderId, stockReleasedAt: null },
            data: {
                stockReleasedAt: new Date(),
                status: "CANCELLED",
            },
        });

        if (fenced.count === 0) {
            return false;
        }

        for (const item of order.items) {
            await tx.product.update({
                where: { id: item.productId },
                data: { stock: { increment: item.quantity } },
            });
        }

        if (reason) {
            console.log(`[Orders] Released stock for ${orderId}: ${reason}`);
        }
        return true;
    });
};

/**
 * Cancel unpaid PENDING orders older than UNPAID_ORDER_TTL_MINUTES and
 * restore their stock. Safe to run concurrently with itself and with
 * checkout. Returns the number of orders cancelled.
 */
export const expireStaleUnpaidOrders = async (): Promise<number> => {
    const cutoff = new Date(
        Date.now() - UNPAID_ORDER_TTL_MINUTES * 60 * 1000
    );

    const stale = await prisma.order.findMany({
        where: {
            status: "PENDING",
            paymentStatus: "PENDING",
            stockReleasedAt: null,
            createdAt: { lt: cutoff },
        },
        select: { id: true },
        take: 100,
    });

    let cancelled = 0;
    for (const order of stale) {
        try {
            const didCancel = await cancelOrderAndReleaseStock(
                order.id,
                "unpaid order expired"
            );
            if (didCancel) cancelled += 1;
        } catch (err) {
            console.error(`[Orders] Failed to expire order ${order.id}:`, err);
        }
    }

    return cancelled;
};

/**
 * Lazily expire this user's stale unpaid orders. Called before order reads
 * and before checkout so users don't see stale PENDING orders and don't
 * hit "insufficient stock" for stock their own abandoned order is holding.
 */
const expireUserOrders = async (userId: string): Promise<void> => {
    const cutoff = new Date(
        Date.now() - UNPAID_ORDER_TTL_MINUTES * 60 * 1000
    );
    const stale = await prisma.order.findMany({
        where: {
            userId,
            status: "PENDING",
            paymentStatus: "PENDING",
            stockReleasedAt: null,
            createdAt: { lt: cutoff },
        },
        select: { id: true },
    });

    for (const order of stale) {
        try {
            await cancelOrderAndReleaseStock(order.id, "user-scoped expiry");
        } catch (err) {
            console.error(`[Orders] User-scoped expiry failed for ${order.id}:`, err);
        }
    }
};

export const getUserOrdersWithExpiry = async (userId: string) => {
    await expireUserOrders(userId);
    return getUserOrders(userId);
};

export const getOrderTracking = async (
    orderId: string,
    userId: string,
    isAdmin = false
) => {
    const order = await findOrderById(orderId);
    if (!order) {
        throw new NotFoundError("Order not found with provided ID");
    }

    if (order.userId !== userId && !isAdmin) {
        throw new NotFoundError("Order not found with provided ID");
    }

    const status = order.status;
    const isCancelled = status === "CANCELLED";
    const isPlaced = true;
    const isPackaged =
        status === "PROCESSING" || status === "SHIPPED" || status === "DELIVERED";
    const isOnDelivery = status === "SHIPPED" || status === "DELIVERED";
    const isDelivered = status === "DELIVERED";

    const milestones = [
        {
            key: "PLACED",
            title: "Order Placed",
            description: "Confirmed and logged in atelier queue.",
            completed: isPlaced,
            current: status === "PENDING",
            timestamp: order.createdAt,
        },
        {
            key: "PACKAGED",
            title: "Order Packaged",
            description: "Bespoke packaging and artisan quality inspection completed.",
            completed: isPackaged,
            current: status === "PROCESSING",
        },
        {
            key: "ON_DELIVERY",
            title: "Order on Delivery",
            description: "In transit with courier to destination.",
            completed: isOnDelivery,
            current: status === "SHIPPED",
        },
        {
            key: "DELIVERED",
            title: "Delivered",
            description: "Signed and received by patron.",
            completed: isDelivered,
            current: status === "DELIVERED",
        },
    ];

    return {
        id: order.id,
        status: order.status,
        paymentStatus: order.paymentStatus,
        deliveryMethod: order.deliveryMethod,
        total: Number(order.total),
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        milestones,
        isCancelled,
        items: order.items.map((item) => ({
            id: item.id,
            productName: item.product.name,
            productImage: item.product.image,
            quantity: item.quantity,
            price: Number(item.price),
        })),
        customerName: `${order.user.firstName} ${order.user.lastName}`,
        carrier: "Vroom Express Courier",
        estimatedDelivery: "3-7 days nationwide",
    };
};
