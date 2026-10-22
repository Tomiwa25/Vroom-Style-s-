import bcrypt from "bcrypt";
import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import app from "../src/app.js";
import prisma from "../src/config/database.js";
import { cleanDatabase } from "./helper/test-db.js";

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
            .set("Authorization", `Bearer ${token}`);

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
        expect(trackRes.body.data.milestones).toHaveLength(5);
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

        expect(trackRes.status).toBe(400);
        expect(trackRes.body.success).toBe(false);
        expect(trackRes.body.message).toContain("not authorized");
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
});


