import bcrypt from "bcrypt";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import app from "../src/app.js";
import prisma from "../src/config/database.js";
import { cleanDatabase } from "./helper/test-db.js";

describe("Admin API", () => {
    beforeEach(async () => {
        await cleanDatabase();
    });

    it("should reject unauthenticated users", async () => {
        const response = await request(app)
            .get("/api/admin/dashboard");

        expect(response.status).toBe(401);
    });

    it("should reject customer tokens from reaching the admin dashboard", async () => {
        await request(app)
            .post("/api/auth/register")
            .send({
                email: "customer@example.com",
                password: "secret123",
                firstName: "Customer",
                lastName: "User",
            });

        const login = await request(app)
            .post("/api/auth/login")
            .send({
                email: "customer@example.com",
                password: "secret123",
            });

        const token = login.body.data.token;

        const response = await request(app)
            .get("/api/admin/dashboard")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toMatch(/permission denied|Permission denied/i);
    });

    it("should allow an admin user to see the admin dashboard", async () => {
        const hashedPassword = await bcrypt.hash("secret123", 10);

        await prisma.user.create({
            data: {
                email: "admin@example.com",
                password: hashedPassword,
                firstName: "Admin",
                lastName: "User",
                role: "ADMIN",
            },
        });

        const login = await request(app)
            .post("/api/auth/login")
            .send({
                email: "admin@example.com",
                password: "secret123",
            });

        expect(login.status).toBe(200);
        expect(login.body.success).toBe(true);
        expect(login.body.data.token).toBeTruthy();

        const response = await request(app)
            .get("/api/admin/dashboard")
            .set("Authorization", `Bearer ${login.body.data.token}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty("totalProducts");
        expect(response.body.data).toHaveProperty("totalOrders");
        expect(response.body.data).toHaveProperty("totalCustomers");
    });
});