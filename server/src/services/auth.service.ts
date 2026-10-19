import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OtpType } from "@prisma/client";
import {
  createUser,
  findUserByEmail,
  findUserById,
  markUserVerified,
} from "../repositories/user.repositories.js";
import {
  createOtp,
  findLatestActiveOtp,
  incrementOtpAttempts,
  invalidatePreviousOtps,
  markOtpUsed,
} from "../repositories/otp.repository.js";
import { sendOtpVerificationEmail } from "./email.service.js";

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return secret;
};

export const generateSixDigitOtp = (): string => {
  return crypto.randomInt(100000, 1000000).toString();
};

export const registerUser = async (data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}) => {
  const normalizedEmail = data.email.toLowerCase().trim();
  const existingUser = await findUserByEmail(normalizedEmail);
  if (existingUser) {
    throw new Error("Email already registered");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await createUser({
    email: normalizedEmail,
    password: hashedPassword,
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    isVerified: false,
  });

  // Generate 6-digit OTP code with 10 minutes expiry
  const otpCode = generateSixDigitOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await invalidatePreviousOtps(normalizedEmail, OtpType.EMAIL_VERIFICATION);
  await createOtp({
    email: normalizedEmail,
    code: otpCode,
    type: OtpType.EMAIL_VERIFICATION,
    expiresAt,
  });

  // Send the luxury Vroom Style(s) OTP email
  await sendOtpVerificationEmail({
    to: user.email,
    firstName: user.firstName,
    code: otpCode,
  });

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    isVerified: user.isVerified,
    requiresVerification: true,
  };
};

export const verifyUserOtp = async (email: string, code: string) => {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    throw new Error("No account found with this email address");
  }

  const activeOtp = await findLatestActiveOtp(
    normalizedEmail,
    OtpType.EMAIL_VERIFICATION
  );

  if (!activeOtp) {
    throw new Error("Verification code has expired or is invalid. Please request a new code.");
  }

  if (activeOtp.attempts >= 5) {
    throw new Error("Too many incorrect attempts. Please request a new verification code.");
  }

  if (activeOtp.code !== code.trim()) {
    await incrementOtpAttempts(activeOtp.id);
    throw new Error("Invalid verification code. Please check your email and try again.");
  }

  // Mark OTP as used and update user
  await markOtpUsed(activeOtp.id);
  const updatedUser = await markUserVerified(user.id);

  // Generate JWT token for seamless auto-login upon verification
  const token = jwt.sign(
    {
      userId: updatedUser.id,
      role: updatedUser.role,
      isVerified: true,
    },
    getJwtSecret(),
    {
      expiresIn: "7d",
    }
  );

  return {
    token,
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      role: updatedUser.role,
      isVerified: true,
    },
  };
};

export const resendVerificationOtp = async (email: string) => {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    throw new Error("No account found with this email address");
  }

  if (user.isVerified) {
    return {
      alreadyVerified: true,
      message: "Account is already verified. You may sign in directly.",
    };
  }

  // Invalidate previous OTPs
  await invalidatePreviousOtps(normalizedEmail, OtpType.EMAIL_VERIFICATION);

  // Generate new 6-digit OTP
  const otpCode = generateSixDigitOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await createOtp({
    email: normalizedEmail,
    code: otpCode,
    type: OtpType.EMAIL_VERIFICATION,
    expiresAt,
  });

  await sendOtpVerificationEmail({
    to: user.email,
    firstName: user.firstName,
    code: otpCode,
  });

  return {
    alreadyVerified: false,
    message: "A new 6-digit verification code has been dispatched to your email.",
  };
};

export const loginUser = async (email: string, password: string) => {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    throw new Error("Invalid Credentials");
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    throw new Error("Either Username or password is incorrect");
  }

  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
      isVerified: user.isVerified,
    },
    getJwtSecret(),
    {
      expiresIn: "7d",
    }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isVerified: user.isVerified,
    },
    requiresVerification: !user.isVerified,
  };
};

export const getCurrentUser = async (userId: string) => {
  const user = await findUserById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    isVerified: user.isVerified,
  };
};
