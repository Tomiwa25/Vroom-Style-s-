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
});
