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

  // Content Security Policy.
  // This API serves JSON (no HTML), so the strictest sensible policy applies.
  // The client SPA should set its own policy that allows Paystack inline.js,
  // api.paystack.co, and checkout.paystack.com.
  const isProduction = process.env.NODE_ENV === "production";
  res.setHeader(
    "Content-Security-Policy",
    isProduction
      ? "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"
      : "default-src 'self'"
  );

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

  // 4. Malformed JSON body (express.json throws SyntaxError with status 400)
  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({
      success: false,
      message: "Malformed JSON request body",
    });
    return;
  }

  // 5. Errors carrying an explicit, trusted HTTP status (e.g. express body-parser).
  //    Only accept 4xx here — a non-AppError claiming 5xx is treated as a real crash.
  const explicitStatus =
    typeof err.statusCode === "number"
      ? err.statusCode
      : typeof err.status === "number"
      ? err.status
      : null;

  const isProduction = process.env.NODE_ENV === "production";

  if (explicitStatus && explicitStatus >= 400 && explicitStatus < 500) {
    res.status(explicitStatus).json({
      success: false,
      message: err.message || "Request could not be processed",
    });
    return;
  }

  // 6. Anything else is an unexpected server fault. Never leak internals.
  res.status(500).json({
    success: false,
    message: isProduction
      ? "An unexpected internal server error occurred"
      : err.message || "Internal server error",
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
