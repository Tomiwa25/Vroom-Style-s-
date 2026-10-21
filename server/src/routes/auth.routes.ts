import { Router } from "express";
import {
  registerController,
  loginController,
  getCurrentUserController,
  verifyOtpController,
  resendOtpController,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  authLimiter,
  otpResendLimiter,
} from "../middleware/rate-limit.middleware.js";

const router = Router();

router.post("/register", authLimiter, registerController);
router.post("/login", authLimiter, loginController);
router.post("/verify-otp", verifyOtpController);
router.post("/resend-otp", otpResendLimiter, resendOtpController);
router.get("/currentUser", authenticate, getCurrentUserController);

export default router;