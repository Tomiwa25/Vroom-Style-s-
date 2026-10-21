import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../src/app.js";
import {
  apiLimiter,
  authLimiter,
  otpResendLimiter,
  createTestableLimiter,
} from "../src/middleware/rate-limit.middleware.js";

describe("API Rate Limiting Middleware", () => {
  it("should have all rate limiter middlewares defined and exported", () => {
    expect(typeof apiLimiter).toBe("function");
    expect(typeof authLimiter).toBe("function");
    expect(typeof otpResendLimiter).toBe("function");
    expect(typeof createTestableLimiter).toBe("function");
  });

  it("should enforce rate limiting and return HTTP 429 when max requests threshold is exceeded", async () => {
    const testApp = express();
    testApp.use(express.json());

    const limiter = createTestableLimiter({
      windowMs: 60 * 1000,
      max: 2,
      message: "Too many authentication attempts. Please try again after 15 minutes.",
    });

    testApp.post("/test-auth-limit", limiter, (_req, res) => {
      res.status(200).json({ success: true, message: "Allowed" });
    });

    // 1st request -> allowed
    const res1 = await request(testApp).post("/test-auth-limit").send();
    expect(res1.status).toBe(200);
    expect(res1.body.success).toBe(true);

    // 2nd request -> allowed
    const res2 = await request(testApp).post("/test-auth-limit").send();
    expect(res2.status).toBe(200);
    expect(res2.body.success).toBe(true);

    // 3rd request -> blocked with HTTP 429 Too Many Requests
    const res3 = await request(testApp).post("/test-auth-limit").send();
    expect(res3.status).toBe(429);
    expect(res3.body.success).toBe(false);
    expect(res3.body.message).toBe("Too many authentication attempts. Please try again after 15 minutes.");
    expect(res3.headers["ratelimit-limit"]).toBe("2");
    expect(res3.headers["ratelimit-remaining"]).toBe("0");
  });

  it("should keep /api/health exempt from rate limiting", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("VROOM STYLE(s) API is running");
  });
});
