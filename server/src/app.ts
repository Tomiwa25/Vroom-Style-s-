import express from "express";
import cors from "cors";
import productRoutes from "./routes/product.routes.js";
import authRoutes from "./routes/auth.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import { apiLimiter } from "./middleware/rate-limit.middleware.js";
import {
  securityHeadersMiddleware,
  requestSanitizerMiddleware,
  errorHandlerMiddleware,
  notFoundHandler,
} from "./middleware/security.middleware.js";

const app = express();

// Disable express identification banner
app.disable("x-powered-by");

// 1. HTTP Security Headers (OWASP compliant)
app.use(securityHeadersMiddleware);

// 2. Strict CORS policy
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.CORS_ORIGIN,
  process.env.VITE_API_URL,
  "https://vroom-style-s.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
].filter((origin): origin is string => Boolean(origin));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  })
);

// 3. Raw parser for webhook HMAC verification
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

// 4. Bounded body size limits to prevent Denial of Service (DoS) memory exhaustion
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// 5. Input Sanitizer & Prototype Pollution Protection
app.use(requestSanitizerMiddleware);

// 6. Health Check Endpoint
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "VROOM STYLE(s) API is running",
  });
});

// 7. Global API Rate Limiter
app.use("/api", apiLimiter);

// 8. Application Routes
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);

// 9. Unmatched 404 handler for API routes
app.use(notFoundHandler);

// 10. Centralized secure error handling middleware
app.use(errorHandlerMiddleware);

export default app;