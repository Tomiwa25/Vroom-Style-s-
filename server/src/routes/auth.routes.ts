import { Router } from "express";
import {
  registerController,
  loginController,
  getCurrentUserController,
  verifyOtpController,
  resendOtpController,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.post("/verify-otp", verifyOtpController);
router.post("/resend-otp", resendOtpController);
router.get("/currentUser", authenticate, getCurrentUserController);

export default router;