import bcrypt from "bcrypt";
import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import app from "../src/app.js";
import prisma from "../src/config/database.js";
import { cleanDatabase } from "./helper/test-db.js";

describe("Cart API", () => {
    beforeEach(async () => {
        await cleanDatabase();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    it("should reject anonymous access to the cart route", async () => {
        const response = await request(app).get("/api/cart");

        expect(response.status).toBe(401);
    });

    it("should add a product to the cart for an authenticated customer", async () => {
        const passwordHash = await bcrypt.hash("secret123", 10);

        await prisma.user.create({
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
                name: "Cart Test Product",
                description: "A product used for cart API integration testing",
                price: "25.00",
                image: "https://example.com/product.jpg",
                category: "Clothing",
                stock: 6,
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
            .post("/api/cart/items")
            .set("Authorization", `Bearer ${token}`)
            .send({
                productId: product.id,
                quantity: 1,
            });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty("id");
        expect(response.body.data.product.id).toBe(product.id);
        expect(response.body.data.quantity).toBe(1);
    });

    it("should reject adding item with a malformed non-UUID productId with 400 Bad Request", async () => {
        const passwordHash = await bcrypt.hash("secret123", 10);
        await prisma.user.create({
            data: {
                email: "uuidcheck@example.com",
                password: passwordHash,
                firstName: "UUID",
                lastName: "Check",
                role: "CUSTOMER",
            },
        });

        const login = await request(app)
            .post("/api/auth/login")
            .send({
                email: "uuidcheck@example.com",
                password: "secret123",
            });

        const token = login.body.data.token;

        const response = await request(app)
            .post("/api/cart/items")
            .set("Authorization", `Bearer ${token}`)
            .send({
                productId: "not-a-valid-uuid",
                quantity: 1,
            });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });

    it("should reject cart item updates with a non-UUID parameter with 400 Bad Request", async () => {
        const passwordHash = await bcrypt.hash("secret123", 10);
        await prisma.user.create({
            data: {
                email: "uuidparam@example.com",
                password: passwordHash,
                firstName: "Param",
                lastName: "Check",
                role: "CUSTOMER",
            },
        });

        const login = await request(app)
            .post("/api/auth/login")
            .send({
                email: "uuidparam@example.com",
                password: "secret123",
            });

        const token = login.body.data.token;

        const response = await request(app)
            .patch("/api/cart/items/invalid-cart-id")
            .set("Authorization", `Bearer ${token}`)
            .send({
                quantity: 2,
            });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });
});
