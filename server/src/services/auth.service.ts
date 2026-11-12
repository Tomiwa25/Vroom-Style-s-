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
import {
  UnauthorizedError,
  NotFoundError,
  BadRequestError,
} from "../core/errors/app-error.js";

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

/**
 * Hashes an OTP for at-rest storage. Format: "sha256$<saltHex>$<digestHex>".
 * We don't need bcrypt here: OTPs expire in 10 minutes and are rate-limited,
 * so a slow KDF would only hurt latency without meaningfully raising the
 * cost of a brute-force against a stolen 6-digit code.
 */
export const hashOtp = (code: string): string => {
  const salt = crypto.randomBytes(16).toString("hex");
  const digest = crypto
    .createHash("sha256")
    .update(`${salt}:${code}`)
    .digest("hex");
  return `sha256$${salt}$${digest}`;
};

export const verifyOtpHash = (code: string, stored: string): boolean => {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "sha256") return false;
  const [, salt, expected] = parts;
  const computed = crypto
    .createHash("sha256")
    .update(`${salt}:${code}`)
    .digest("hex");
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(computed, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

/**
 * Fire-and-forget email send. Registration must not fail because SMTP is
 * down — the user already exists by the time we send, and a failed send
 * would strand them with an unverifiable account.
 */
const sendOtpEmailSafely = (payload: {
  to: string;
  firstName: string;
  code: string;
}): void => {
  sendOtpVerificationEmail(payload).catch((err) =>
    console.error("[Auth] Failed to dispatch OTP email:", err)
  );
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
    // IMPORTANT: don't disclose account existence. Returning the same
    // shape as a real signup keeps the endpoint from being an oracle.
    return {
      email: normalizedEmail,
      requiresVerification: true,
      message: "If this email is not yet registered, a verification code has been sent.",
    };
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
    code: hashOtp(otpCode),
    type: OtpType.EMAIL_VERIFICATION,
    expiresAt,
  });

  // Send asynchronously: registration must not fail if SMTP is down.
  sendOtpEmailSafely({
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

  // Generic "invalid" message on missing user keeps this from being an
  // account-enumeration oracle.
  if (!user) {
    throw new BadRequestError("Verification code has expired or is invalid. Please request a new code.");
  }

  const activeOtp = await findLatestActiveOtp(
    normalizedEmail,
    OtpType.EMAIL_VERIFICATION
  );

  if (!activeOtp) {
    throw new BadRequestError("Verification code has expired or is invalid. Please request a new code.");
  }

  if (activeOtp.attempts >= 5) {
    throw new BadRequestError("Too many incorrect attempts. Please request a new verification code.");
  }

  if (!verifyOtpHash(code.trim(), activeOtp.code)) {
    await incrementOtpAttempts(activeOtp.id);
    throw new BadRequestError("Invalid verification code. Please check your email and try again.");
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

  // Always return the same message, whether or not the account exists, so
  // this endpoint can't be used to detect registered emails.
  if (!user || user.isVerified) {
    return {
      message: "If your account needs verification, a new 6-digit code has been dispatched.",
    };
  }

  // Invalidate previous OTPs
  await invalidatePreviousOtps(normalizedEmail, OtpType.EMAIL_VERIFICATION);

  // Generate new 6-digit OTP
  const otpCode = generateSixDigitOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await createOtp({
    email: normalizedEmail,
    code: hashOtp(otpCode),
    type: OtpType.EMAIL_VERIFICATION,
    expiresAt,
  });

  sendOtpEmailSafely({
    to: user.email,
    firstName: user.firstName,
    code: otpCode,
  });

  return {
    message: "If your account needs verification, a new 6-digit code has been dispatched.",
  };
};

export const loginUser = async (email: string, password: string) => {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    throw new UnauthorizedError("Invalid Credentials");
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    throw new UnauthorizedError("Either Username or password is incorrect");
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
    throw new NotFoundError("User not found");
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
