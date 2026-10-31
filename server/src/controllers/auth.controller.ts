import { Request, Response } from "express";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  verifyUserOtp,
  resendVerificationOtp,
} from "../services/auth.service.js";
import { loginSchema } from "../validators/auth.validator.js";
import { getAuthUser } from "../middleware/auth.middleware.js";
import { ApiResponse } from "../core/http/api-response.js";
import { asyncHandler } from "../core/http/async-handler.js";

/**
 * HTTP Adapter Controller for Authentication & Identity.
 * Extracts parameters and delegates credential / OTP flows to AuthService.
 */
export const registerController = asyncHandler(async (req: Request, res: Response) => {
  const user = await registerUser(req.body);
  return ApiResponse.created(
    res,
    user,
    "Account created successfully. A 6-digit verification code has been sent to your email."
  );
});

export const verifyOtpController = asyncHandler(async (req: Request, res: Response) => {
  const result = await verifyUserOtp(req.body.email, req.body.code);
  return ApiResponse.success(
    res,
    result,
    "Email verified successfully. Welcome to Vroom Style(s)!"
  );
});

export const resendOtpController = asyncHandler(async (req: Request, res: Response) => {
  const result = await resendVerificationOtp(req.body.email);
  return ApiResponse.success(res, result, result.message);
});

export const loginController = asyncHandler(async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(401).json({
      success: false,
      message: parsed.error.issues[0]?.message || "Invalid credentials",
      errors: parsed.error.issues,
    });
  }

  const result = await loginUser(parsed.data.email, parsed.data.password);
  return ApiResponse.success(res, result, "Login successful");
});

export const getCurrentUserController = asyncHandler(async (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const currentUser = await getCurrentUser(user.userId);
  return ApiResponse.success(res, currentUser);
});