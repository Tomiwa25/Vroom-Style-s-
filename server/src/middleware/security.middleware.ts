import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { AppError } from "../core/errors/app-error.js";

/**
 * In-place sanitization that strips dangerous prototype pollution keys
 * and null-bytes without reassigning getters on IncomingMessage (Express 5 safe).
 */
const sanitizeInPlace = (target: any): void => {
  if (!target || typeof target !== "object") return;

  for (const key of Object.keys(target)) {
    // Block prototype pollution attempts
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      delete target[key];
      continue;
    }

    if (typeof target[key] === "string") {
      target[key] = target[key].replace(/\0/g, "");
    } else if (typeof target[key] === "object" && target[key] !== null) {
      sanitizeInPlace(target[key]);
    }
  }
};

/**
 * Security headers middleware enforcing OWASP and industry best practices.
 */
export const securityHeadersMiddleware = (
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Prevent MIME sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Prevent framing / clickjacking
  res.setHeader("X-Frame-Options", "DENY");

  // Modern browsers disable legacy buggy XSS auditors
  res.setHeader("X-XSS-Protection", "0");

  // Enforce HSTS (Strict-Transport-Security)
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );

  // Referrer policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Restrict sensitive browser features
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(self)"
  );

  // Remove Express fingerprinting
  res.removeHeader("X-Powered-By");

  next();
};

/**
 * Sanitizes input in-place to mitigate prototype pollution and injection vectors.
 */
export const requestSanitizerMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (req.body && typeof req.body === "object") {
    sanitizeInPlace(req.body);
  }
  if (req.query && typeof req.query === "object") {
    sanitizeInPlace(req.query);
  }
  if (req.params && typeof req.params === "object") {
    sanitizeInPlace(req.params);
  }
  next();
};

/**
 * Centralized Gateway Error Boundary ensuring proper architectural isolation.
 * Translates domain exceptions and perimeter errors into standardized HTTP responses,
 * while preventing sensitive database schemas and internal stack traces from leaking.
 */
export const errorHandlerMiddleware = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (process.env.NODE_ENV !== "test") {
    console.error("[Gateway Error Boundary]", err);
  }

  // 1. Zod Validation Errors caught at Gateway boundary
  if (err instanceof z.ZodError) {
    res.status(400).json({
      success: false,
      message: err.issues[0]?.message || "Invalid input data",
      errors: err.issues,
    });
    return;
  }

  // 2. Explicit Domain / Application Errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors ? { errors: err.errors } : {}),
    });
    return;
  }

  // 3. JWT Authentication Errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    res.status(401).json({
      success: false,
      message: "Unauthorized: invalid or expired token",
    });
    return;
  }

  // 4. Domain errors thrown as standard Error with explicit messages
  const statusCode =
    typeof err.statusCode === "number"
      ? err.statusCode
      : typeof err.status === "number"
      ? err.status
      : err instanceof Error && err.name === "Error"
      ? 400
      : 500;

  const isProduction = process.env.NODE_ENV === "production";
  const clientMessage =
    statusCode === 500 && isProduction
      ? "An unexpected internal server error occurred"
      : err.message || "Internal server error";

  res.status(statusCode).json({
    success: false,
    message: clientMessage,
  });
};

/**
 * Safe 404 JSON fallback handler for non-existent API routes.
 */
export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: "Requested API endpoint not found",
  });
};
