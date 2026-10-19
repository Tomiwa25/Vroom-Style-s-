import { z } from "zod";

export const registerSchema = z.object({
    email: z.string().email("Please provide a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    firstName: z.string().min(2, "First name must be at least 2 characters long"),
    lastName: z.string().min(2, "Last name must be at least 2 characters long")
});

export const loginSchema = z.object({
    email: z.string().email("Please provide a valid email address"),
    password: z.string().min(1, "Password is required")
});

export const verifyOtpSchema = z.object({
    email: z.string().email("Please provide a valid email address"),
    code: z.string().regex(/^\d{6}$/, "Verification code must be exactly 6 digits")
});

export const resendOtpSchema = z.object({
    email: z.string().email("Please provide a valid email address")
});