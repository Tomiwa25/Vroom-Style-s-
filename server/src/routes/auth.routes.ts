import { Router } from "express";
import {
  registerController,
  loginController,
  getCurrentUserController,
  verifyOtpController,
  resendOtpController,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import {
  authLimiter,
  otpResendLimiter,
} from "../middleware/rate-limit.middleware.js";
import {
  registerSchema,
  verifyOtpSchema,
  resendOtpSchema,
} from "../validators/auth.validator.js";

const router = Router();

router.post(
  "/register",
  authLimiter,
  validateRequest({ body: registerSchema }),
  registerController
);
router.post("/login", authLimiter, loginController);
router.post(
  "/verify-otp",
  validateRequest({ body: verifyOtpSchema }),
  verifyOtpController
);
router.post(
  "/resend-otp",
  otpResendLimiter,
  validateRequest({ body: resendOtpSchema }),
  resendOtpController
);
router.get("/currentUser", authenticate, getCurrentUserController);

export default router;