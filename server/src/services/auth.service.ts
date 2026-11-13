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
  AppError,
  UnauthorizedError,
  NotFoundError,
  BadRequestError,
  ConflictError,
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

/**
 * Issues a fresh verification code for an existing (unverified) account.
 * Kept separate from the email dispatch so a database hiccup here can be
 * reported without ever rolling back a registration the user just completed.
 */
const issueVerificationOtp = async (email: string): Promise<string> => {
  const otpCode = generateSixDigitOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await invalidatePreviousOtps(email, OtpType.EMAIL_VERIFICATION);
  await createOtp({
    email,
    code: hashOtp(otpCode),
    type: OtpType.EMAIL_VERIFICATION,
    expiresAt,
  });

  return otpCode;
};

/**
 * Database failures are ours, not the visitor's. Say so, and say which one,
 * so an empty database_url or an un-migrated schema is obvious at a glance.
 */
const toRegistrationError = (err: unknown): Error => {
  const code = (err as { code?: string } | null)?.code;

  if (code === "P2002") {
    return new ConflictError(
      "An account with this email already exists. Please sign in instead."
    );
  }

  if (code === "P2021" || code === "P2022" || code === "P1001" || code === "P1000") {
    console.error("[Auth] Registration reached an unusable database:", err);
    return new AppError(
      "We couldn't reach our account service. Please try again shortly.",
      503
    );
  }

  // Any other failure must never become a silent "unexpected server error".
  // Operational errors keep their message; everything else gets a generic but
  // honest one instead of leaking internals.
  return err instanceof AppError
    ? err
    : new AppError("Registration could not be completed. Please try again shortly.", 503);
};

export const registerUser = async (data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}) => {
  const normalizedEmail = data.email.toLowerCase().trim();

  // Fail before we write anything if the server can't mint tokens: otherwise
  // the visitor ends up with an account that can never be logged into.
  getJwtSecret();

  try {
    const existingUser = await findUserByEmail(normalizedEmail);
    if (existingUser) {
      // IMPORTANT: don't disclose account existence. Returning the same
      // shape as a real signup keeps the endpoint from being an oracle.
      if (!existingUser.isVerified) {
        await issueVerificationOtp(normalizedEmail)
          .then((code) =>
            sendOtpEmailSafely({
              to: existingUser.email,
              firstName: existingUser.firstName,
              code,
            })
          )
          .catch((err) =>
            console.error("[Auth] Could not re-issue verification code:", err)
          );
      }
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

    // The account now exists. Anything past this point is best-effort: a
    // missing code only means the visitor has to tap "resend".
    await issueVerificationOtp(normalizedEmail)
      .then((otpCode) =>
        sendOtpEmailSafely({
          to: user.email,
          firstName: user.firstName,
          code: otpCode,
        })
      )
      .catch((err) =>
        console.error("[Auth] Account created but verification code was not issued:", err)
      );

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isVerified: user.isVerified,
        requiresVerification: true,
      };
  } catch (err) {
    throw toRegistrationError(err);
  }
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
