import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../src/app.js";

describe("Product API", () => {
    it("should return a paginated list of products", async () => {
        const response = await request(app)
            .get("/api/products")
            .query({ limit: 10, skip: 0 });

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveProperty("products");
        
    });

    it("should search products by query", async () => {
        const response = await request(app)
            .get("/api/products/search?q=shirt");

        expect(response.status).toBe(200);
    });

    it("should reject search queries exceeding 100 characters on /search with 400 Bad Request", async () => {
        const oversizedQuery = "a".repeat(101);
        const response = await request(app)
            .get(`/api/products/search?q=${oversizedQuery}`);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Search query cannot exceed 100 characters");
    });

    it("should reject search queries exceeding 100 characters on / with 400 Bad Request", async () => {
        const oversizedQuery = "a".repeat(101);
        const response = await request(app)
            .get(`/api/products?q=${oversizedQuery}`);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Search query cannot exceed 100 characters");
    });
});
