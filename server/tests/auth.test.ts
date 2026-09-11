import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import app from "../src/app.js";
import prisma from "../src/config/database.js";
import { cleanDatabase } from "./helper/test-db.js";

describe("Authentication", () => {
    beforeEach(async () => {
        await cleanDatabase();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    it("should register a new user", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send({
                email: "admin@example.com",
                password: "secret123",
                firstName: "Admin",
                lastName: "User",
            });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.email).toBe("admin@example.com");
    });

    it("should hash the user password before storing it", async () => {
        await request(app)
            .post("/api/auth/register")
            .send({
                email: "hash@example.com",
                password: "secret123",
                firstName: "Hash",
                lastName: "User",
            });

        const user = await prisma.user.findUnique({
            where: {
                email: "hash@example.com",
            },
            select: {
                password: true,
            },
        });

        expect(user).not.toBeNull();
        expect(user?.password).not.toBe("secret123");
        expect(user?.password).toMatch(/^\$2[aby]\$\d{2}\$[.\/A-Za-z0-9]{53}$/);
        expect(user!.password.startsWith("$2")).toBe(true);
    });

    it("should login an existing user and return a token", async () => {
        await request(app)
            .post("/api/auth/register")
            .send({
                email: "login@example.com",
                password: "secret123",
                firstName: "Login",
                lastName: "User",
            });

        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: "login@example.com",
                password: "secret123",
            });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty("token");
        expect(response.body.data.user).toHaveProperty("email", "login@example.com");
        expect(typeof response.body.data.token).toBe("string");
    });

    it("should return the current authenticated user from the token", async () => {
        await request(app)
            .post("/api/auth/register")
            .send({
                email: "current@example.com",
                password: "secret123",
                firstName: "Current",
                lastName: "User",
            });

        const login = await request(app)
            .post("/api/auth/login")
            .send({
                email: "current@example.com",
                password: "secret123",
            });

        const token = login.body.data.token;

        const response = await request(app)
            .get("/api/auth/currentUser")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.email).toBe("current@example.com");
        expect(response.body.data.role).toBe("CUSTOMER");
    });
});

describe("Authentication", () => {
    it("should reject invalid login data", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: "admin@example.com",
                password: "",
            });

        expect(response.status).toBe(401);
    });
});