import { z } from "zod";

export const registerSchema = z.object({
    email: z.string().trim().email("Please provide a valid email address").max(254, "Email cannot exceed 254 characters"),
    password: z.string().min(8, "Password must be at least 8 characters long").max(100, "Password cannot exceed 100 characters"),
    firstName: z.string().trim().min(2, "First name must be at least 2 characters long").max(50, "First name cannot exceed 50 characters"),
    lastName: z.string().trim().min(2, "Last name must be at least 2 characters long").max(50, "Last name cannot exceed 50 characters")
});

export const loginSchema = z.object({
    email: z.string().trim().email("Please provide a valid email address").max(254, "Email cannot exceed 254 characters"),
    password: z.string().min(1, "Password is required").max(100, "Password cannot exceed 100 characters")
});

export const verifyOtpSchema = z.object({
    email: z.string().email("Please provide a valid email address"),
    code: z.string().regex(/^\d{6}$/, "Verification code must be exactly 6 digits")
});

export const resendOtpSchema = z.object({
    email: z.string().email("Please provide a valid email address")
});