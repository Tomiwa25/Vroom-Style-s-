import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../src/app.js";


describe("Health Check", () => {
    it("should return 200", async () => {
        const response = await request(app).get("/api/health");

        expect(response.status).toBe(200);
    });
});