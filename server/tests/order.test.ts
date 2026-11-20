import bcrypt from "bcrypt";
import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import app from "../src/app.js";
import prisma from "../src/config/database.js";
import { cleanDatabase } from "./helper/test-db.js";
import { expireStaleUnpaidOrders } from "../src/services/order.service.js";

describe("Order API", () => {
    beforeEach(async () => {
        await cleanDatabase();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    it("should create an order from a cart for an authenticated customer", async () => {
        const passwordHash = await bcrypt.hash("secret123", 10);

        const user = await prisma.user.create({
            data: {
                email: "customer@example.com",
                password: passwordHash,
                firstName: "Customer",
                lastName: "User",
                role: "CUSTOMER",
                isVerified: true,
            },
        });

        const product = await prisma.product.create({
            data: {
                name: "Checkout Product",
                description: "A product used for checkout testing",
                price: "25.00",
                image: "https://example.com/product.jpg",
                category: "Clothing",
                stock: 10,
            },
        });

        await prisma.cart.create({
            data: {
                userId: user.id,
                items: {
                    create: {
                        productId: product.id,
                        quantity: 2,
                    },
                },
            },
        });

        const login = await request(app)
            .post("/api/auth/login")
            .send({
                email: "customer@example.com",
                password: "secret123",
            });

        expect(login.status).toBe(200);
        expect(login.body.success).toBe(true);

        const token = login.body.data.token;

        const response = await request(app)
            .post("/api/orders")
            .set("Authorization", `Bearer ${token}`)
            .set("Idempotency-Key", "order-test-create-cart-1");

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty("items");
        expect(response.body.data.total).toBe("50");
        expect(response.body.data.paymentStatus).toBe("PENDING");
        expect(response.body.data.status).toBe("PENDING");

        const updatedProduct = await prisma.product.findUnique({
            where: {
                id: product.id,
            },
        });

        expect(updatedProduct?.stock).toBe(8);

        const order = await prisma.order.findFirst({
            where: {
                userId: user.id,
            },
            include: {
                items: true,
            },
        });

        expect(order).not.toBeNull();
        expect(order?.items[0]?.price.toString()).toBe("25");
        expect(order?.items[0]?.quantity).toBe(2);
    });

    it("should retrieve real-time fulfillment milestones for an authenticated user's order", async () => {
        const passwordHash = await bcrypt.hash("secret123", 10);

        const user = await prisma.user.create({
            data: {
                email: "trackowner@example.com",
                password: passwordHash,
                firstName: "Track",
                lastName: "Owner",
                role: "CUSTOMER",
            },
        });

        const product = await prisma.product.create({
            data: {
                name: "Silk Blazer",
                description: "Luxury blazer",
                price: "120.00",
                image: "https://example.com/blazer.jpg",
                category: "Clothing",
                stock: 5,
            },
        });

        const order = await prisma.order.create({
            data: {
                userId: user.id,
                total: "120.00",
                status: "SHIPPED",
                paymentStatus: "PAID",
                items: {
                    create: {
                        productId: product.id,
                        quantity: 1,
                        price: "120.00",
                    },
                },
            },
        });

        const login = await request(app)
            .post("/api/auth/login")
            .send({
                email: "trackowner@example.com",
                password: "secret123",
            });

        const token = login.body.data.token;

        const trackRes = await request(app)
            .get(`/api/orders/${order.id}/track`)
            .set("Authorization", `Bearer ${token}`);

        expect(trackRes.status).toBe(200);
        expect(trackRes.body.success).toBe(true);
        expect(trackRes.body.data.id).toBe(order.id);
        expect(trackRes.body.data.status).toBe("SHIPPED");
        expect(trackRes.body.data.milestones).toHaveLength(4);
        expect(trackRes.body.data.milestones[0].completed).toBe(true);
        expect(trackRes.body.data.milestones[1].completed).toBe(true);
        expect(trackRes.body.data.milestones[2].completed).toBe(true);
        expect(trackRes.body.data.items[0].productName).toBe("Silk Blazer");
    });

    it("should reject order tracking if user does not own the order", async () => {
        const passwordHash = await bcrypt.hash("secret123", 10);

        const owner = await prisma.user.create({
            data: {
                email: "realowner@example.com",
                password: passwordHash,
                firstName: "Real",
                lastName: "Owner",
            },
        });

        const otherUser = await prisma.user.create({
            data: {
                email: "intruder@example.com",
                password: passwordHash,
                firstName: "Intruder",
                lastName: "User",
            },
        });

        const order = await prisma.order.create({
            data: {
                userId: owner.id,
                total: "90.00",
                status: "PENDING",
            },
        });

        const otherLogin = await request(app)
            .post("/api/auth/login")
            .send({
                email: "intruder@example.com",
                password: "secret123",
            });

        const otherToken = otherLogin.body.data.token;

        const trackRes = await request(app)
            .get(`/api/orders/${order.id}/track`)
            .set("Authorization", `Bearer ${otherToken}`);

        // 404, not 403, so non-owners can't distinguish "your order" from
        // "someone else's order" by status code.
        expect(trackRes.status).toBe(404);
        expect(trackRes.body.success).toBe(false);
    });

    it("should create an order directly with explicit client items payload", async () => {
        const passwordHash = await bcrypt.hash("secret123", 10);

        const user = await prisma.user.create({
            data: {
                email: "direct_checkout@example.com",
                password: passwordHash,
                firstName: "Direct",
                lastName: "Shopper",
                role: "CUSTOMER",
                isVerified: true,
            },
        });

        const product = await prisma.product.create({
            data: {
                name: "Direct Silk Robe",
                description: "Luxury piece for direct checkout",
                price: "75000.00",
                image: "https://example.com/robe.jpg",
                category: "Women",
                stock: 5,
            },
        });

        const login = await request(app)
            .post("/api/auth/login")
            .send({
                email: "direct_checkout@example.com",
                password: "secret123",
            });

        const token = login.body.data.token;

        const res = await request(app)
            .post("/api/orders")
            .set("Authorization", `Bearer ${token}`)
            .set("Idempotency-Key", "order-test-direct-checkout-1")
            .send({
                items: [
                    {
                        productId: product.id,
                        quantity: 2,
                    },
                ],
            });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(Number(res.body.data.total)).toBe(150000);
        expect(res.body.data.items).toHaveLength(1);

        // Verify stock decremented
        const updatedProduct = await prisma.product.findUnique({
            where: { id: product.id },
        });
        expect(updatedProduct?.stock).toBe(3);
    });

    it("should reject order checkout if customer email is not verified", async () => {
        const passwordHash = await bcrypt.hash("secret123", 10);

        const unverifiedUser = await prisma.user.create({
            data: {
                email: "unverified_checkout@example.com",
                password: passwordHash,
                firstName: "Unverified",
                lastName: "User",
                role: "CUSTOMER",
                isVerified: false,
            },
        });

        const product = await prisma.product.create({
            data: {
                name: "Gatekeep Item",
                description: "Cannot buy without verified email",
                price: "50.00",
                image: "https://example.com/gatekeep.jpg",
                category: "Accessories",
                stock: 10,
            },
        });

        const login = await request(app)
            .post("/api/auth/login")
            .send({
                email: "unverified_checkout@example.com",
                password: "secret123",
            });

        const token = login.body.data.token;

        const res = await request(app)
            .post("/api/orders")
            .set("Authorization", `Bearer ${token}`)
            .set("Idempotency-Key", "order-test-unverified-checkout-1")
            .send({
                items: [{ productId: product.id, quantity: 1 }],
            });

        expect(res.status).toBe(403);
        expect(res.body.success).toBe(false);
        expect(res.body.requiresVerification).toBe(true);
        expect(res.body.message).toContain("Email verification required");
    });

    it("should gracefully fulfill order from items when client sends source: cart but has no server cart", async () => {
        const passwordHash = await bcrypt.hash("secret123", 10);

        const user = await prisma.user.create({
            data: {
                email: "fallback_client@example.com",
                password: passwordHash,
                firstName: "Fallback",
                lastName: "Shopper",
                role: "CUSTOMER",
                isVerified: true,
            },
        });

        const product = await prisma.product.create({
            data: {
                name: "Atelier Cashmere Scarf",
                description: "Client side cart item fallback",
                price: "45000.00",
                image: "https://example.com/scarf.jpg",
                category: "Knitwear",
                stock: 8,
            },
        });

        const login = await request(app)
            .post("/api/auth/login")
            .send({
                email: "fallback_client@example.com",
                password: "secret123",
            });

        const token = login.body.data.token;

        // Simulate what the client web app sends: source: "cart" with items, but no DB cart exists
        const res = await request(app)
            .post("/api/orders")
            .set("Authorization", `Bearer ${token}`)
            .set("Idempotency-Key", "order-test-fallback-cart-1")
            .send({
                source: "cart",
                items: [{ productId: product.id, quantity: 2 }],
            });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(Number(res.body.data.total)).toBe(90000);
        expect(res.body.data.items).toHaveLength(1);

        const updated = await prisma.product.findUnique({ where: { id: product.id } });
        expect(updated?.stock).toBe(6);
    });

    it("should protect Payment-on-Delivery (POD) orders from stale unpaid order expiration sweep", async () => {
        const passwordHash = await bcrypt.hash("secret123", 10);

        const user = await prisma.user.create({
            data: {
                email: "pod_test@example.com",
                password: passwordHash,
                firstName: "Pod",
                lastName: "Customer",
                role: "CUSTOMER",
                isVerified: true,
            },
        });

        const product = await prisma.product.create({
            data: {
                name: "POD Leather Trench",
                description: "Order reserved with POD",
                price: "95000.00",
                image: "https://example.com/trench.jpg",
                category: "Outerwear",
                stock: 5,
            },
        });

        const login = await request(app)
            .post("/api/auth/login")
            .send({
                email: "pod_test@example.com",
                password: "secret123",
            });

        const token = login.body.data.token;

        // Place a real POD order
        const orderRes = await request(app)
            .post("/api/orders")
            .set("Authorization", `Bearer ${token}`)
            .set("Idempotency-Key", "order-test-pod-order-1")
            .send({
                source: "items",
                deliveryMethod: "POD",
                shipping: {
                    name: "Pod Customer",
                    phone: "+2348012345678",
                    address: "15 Victoria Island Road",
                    city: "Lagos",
                },
                items: [{ productId: product.id, quantity: 1 }],
            });

        expect(orderRes.status).toBe(201);
        const orderId = orderRes.body.data.id;

        // Age the order artificially to simulate passing the 30-minute expiration window (45 mins ago)
        const fortyFiveMinutesAgo = new Date(Date.now() - 45 * 60 * 1000);
        await prisma.order.update({
            where: { id: orderId },
            data: { createdAt: fortyFiveMinutesAgo },
        });

        // Run the background order expiry sweep
        const cancelledCount = await expireStaleUnpaidOrders();
        expect(cancelledCount).toBe(0);

        // Verify the POD order remains PENDING and was NOT cancelled
        const freshOrder = await prisma.order.findUnique({ where: { id: orderId } });
        expect(freshOrder?.status).toBe("PENDING");
        expect(freshOrder?.stockReleasedAt).toBeNull();

        // Verify stock is still reserved (was 5, now 4)
        const productAfterSweep = await prisma.product.findUnique({ where: { id: product.id } });
        expect(productAfterSweep?.stock).toBe(4);
    });

    it("should reject tracking request with malformed non-UUID order ID with 400 Bad Request", async () => {
        const passwordHash = await bcrypt.hash("secret123", 10);
        await prisma.user.create({
            data: {
                email: "uuidorder@example.com",
                password: passwordHash,
                firstName: "Order",
                lastName: "Track",
                role: "CUSTOMER",
            },
        });

        const login = await request(app)
            .post("/api/auth/login")
            .send({
                email: "uuidorder@example.com",
                password: "secret123",
            });

        const token = login.body.data.token;

        const response = await request(app)
            .get("/api/orders/not-a-valid-uuid/track")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });

    it("should reject order checkout without an Idempotency-Key header with 400 IDEMPOTENCY_KEY_REQUIRED", async () => {
        const passwordHash = await bcrypt.hash("secret123", 10);
        await prisma.user.create({
            data: {
                email: "missing_idem@example.com",
                password: passwordHash,
                firstName: "Idem",
                lastName: "Check",
                role: "CUSTOMER",
                isVerified: true,
            },
        });

        const login = await request(app)
            .post("/api/auth/login")
            .send({
                email: "missing_idem@example.com",
                password: "secret123",
            });

        const token = login.body.data.token;

        const response = await request(app)
            .post("/api/orders")
            .set("Authorization", `Bearer ${token}`)
            .send({
                source: "items",
                items: [{ productId: "11111111-1111-1111-1111-111111111111", quantity: 1 }],
            });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.code).toBe("IDEMPOTENCY_KEY_REQUIRED");
    });
});


