import { Request, Response } from "express";
import { z } from "zod";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  verifyUserOtp,
  resendVerificationOtp,
} from "../services/auth.service.js";
import {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema,
} from "../validators/auth.validator.js";

export const registerController = async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const user = await registerUser(validatedData);
    res.status(201).json({
      success: true,
      message: "Account created successfully. A 6-digit verification code has been sent to your email.",
      data: user,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: error.issues[0]?.message || "Invalid input data",
        errors: error.issues,
      });
      return;
    }
    if (error instanceof Error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: "Account registration failed",
    });
  }
};

export const verifyOtpController = async (req: Request, res: Response) => {
  try {
    const validatedData = verifyOtpSchema.parse(req.body);
    const result = await verifyUserOtp(validatedData.email, validatedData.code);
    res.status(200).json({
      success: true,
      message: "Email verified successfully. Welcome to Vroom Style(s)!",
      data: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: error.issues[0]?.message || "Invalid verification code",
        errors: error.issues,
      });
      return;
    }
    if (error instanceof Error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
};

export const resendOtpController = async (req: Request, res: Response) => {
  try {
    const validatedData = resendOtpSchema.parse(req.body);
    const result = await resendVerificationOtp(validatedData.email);
    res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: error.issues[0]?.message || "Invalid email address",
        errors: error.issues,
      });
      return;
    }
    if (error instanceof Error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: "Failed to dispatch verification code",
    });
  }
};

export const loginController = async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const result = await loginUser(validatedData.email, validatedData.password);
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(401).json({
        success: false,
        message: error.issues[0]?.message || "Invalid credentials",
        errors: error.issues,
      });
      return;
    }
    if (error instanceof Error) {
      res.status(401).json({
        success: false,
        message: error.message,
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

export const getCurrentUserController = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }
    const user = await getCurrentUser(req.user.userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
};