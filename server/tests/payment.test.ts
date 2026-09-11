import bcrypt from "bcrypt";
import request from "supertest";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import app from "../src/app.js";
import prisma from "../src/config/database.js";
import { cleanDatabase } from "./helper/test-db.js";
import paystackApi from "../src/services/external/paystack.service.js";

vi.mock("../src/services/external/paystack.service.js", () => ({
    default: {
        post: vi.fn(),
        get: vi.fn(),
    },
}));

describe("Payment API", () => {
    beforeEach(async () => {
        await cleanDatabase();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    it("should initialize and verify a payment by mocking the Paystack client", async () => {
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
                description: "A product used for payment testing",
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

        const checkout = await request(app)
            .post("/api/orders")
            .set("Authorization", `Bearer ${token}`);

        expect(checkout.status).toBe(201);
        expect(checkout.body.success).toBe(true);

        const orderId = checkout.body.data.id;

        const paystackPostSpy = vi.spyOn(paystackApi, "post").mockImplementation(async (_url, payload: any) => {
            return {
                data: {
                    data: {
                        authorization_url: "https://paystack.com/checkout",
                        access_code: "access-code",
                        reference: payload.reference,
                    },
                },
            } as any;
        });

        const initResponse = await request(app)
            .post("/api/payments/initialize")
            .set("Authorization", `Bearer ${token}`)
            .send({ orderId });

        expect(initResponse.status).toBe(200);
        expect(initResponse.body.success).toBe(true);
        expect(initResponse.body.data.authorizationUrl).toBe("https://paystack.com/checkout");
        expect(initResponse.body.data.accessCode).toBe("access-code");
        expect(initResponse.body.data.reference).toMatch(/^VROOM-/);

        const payment = await prisma.payment.findUnique({
            where: {
                orderId,
            },
        });

        expect(payment).not.toBeNull();
        expect(payment?.orderId).toBe(orderId);
        expect(payment?.amount.toString()).toBe("50");
        expect(payment?.status).toBe("PENDING");
        expect(payment?.reference).toBe(initResponse.body.data.reference);

        const paystackGetSpy = vi.spyOn(paystackApi, "get").mockResolvedValue({
            data: {
                data: {
                    status: "success",
                    amount: 5000,
                },
            },
        } as any);

        const verifyResponse = await request(app)
            .post("/api/payments/verify")
            .set("Authorization", `Bearer ${token}`)
            .send({ reference: payment!.reference });

        expect(verifyResponse.status).toBe(200);
        expect(verifyResponse.body.success).toBe(true);
        expect(verifyResponse.body.data.reference).toBe(payment!.reference);

        const updatedPayment = await prisma.payment.findUnique({
            where: {
                orderId,
            },
        });

        const updatedOrder = await prisma.order.findUnique({
            where: {
                id: orderId,
            },
        });

        expect(updatedPayment?.status).toBe("PAID");
        expect(updatedOrder?.paymentStatus).toBe("PAID");
        expect(updatedOrder?.status).toBe("PROCESSING");

        paystackPostSpy.mockRestore();
        paystackGetSpy.mockRestore();
    });
});
