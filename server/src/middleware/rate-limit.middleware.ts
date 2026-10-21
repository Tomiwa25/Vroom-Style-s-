import rateLimit from "express-rate-limit";
import type { Request, Response } from "express";

/**
 * Standard JSON 429 response handler consistent with API schema
 */
const createRateLimitHandler = (message: string) => {
  return (_req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message,
    });
  };
};

/**
 * Global API rate limiter for standard endpoints.
 * Defaults to 100 requests per 15 minutes per IP.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.RATE_LIMIT_GLOBAL_MAX
    ? parseInt(process.env.RATE_LIMIT_GLOBAL_MAX, 10)
    : 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test",
  handler: createRateLimitHandler(
    "Too many requests from this IP address. Please try again after 15 minutes."
  ),
});

/**
 * Strict authentication limiter for Login & Registration routes.
 * Mitigates credential stuffing, brute force, and mass spamming.
 * Defaults to 10 attempts per 15 minutes per IP.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.RATE_LIMIT_AUTH_MAX
    ? parseInt(process.env.RATE_LIMIT_AUTH_MAX, 10)
    : 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test",
  handler: createRateLimitHandler(
    "Too many authentication attempts. Please try again after 15 minutes."
  ),
});

/**
 * Strict OTP resend limiter to prevent email flooding & quota exhaustion.
 * Defaults to 3 requests per 15 minutes per IP.
 */
export const otpResendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.RATE_LIMIT_OTP_MAX
    ? parseInt(process.env.RATE_LIMIT_OTP_MAX, 10)
    : 3,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test",
  handler: createRateLimitHandler(
    "Too many verification code requests. Please wait 15 minutes before requesting another code."
  ),
});

/**
 * Factory helper for testing rate limiting in integration tests
 */
export const createTestableLimiter = (options: {
  windowMs: number;
  max: number;
  message: string;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: createRateLimitHandler(options.message),
  });
};
