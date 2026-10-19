import prisma from "../config/database.js";
import { OtpType } from "@prisma/client";

export const createOtp = async (data: {
  email: string;
  code: string;
  type?: OtpType;
  expiresAt: Date;
}) => {
  return prisma.otpVerification.create({
    data: {
      email: data.email,
      code: data.code,
      type: data.type || OtpType.EMAIL_VERIFICATION,
      expiresAt: data.expiresAt,
    },
  });
};

export const findLatestActiveOtp = async (
  email: string,
  type: OtpType = OtpType.EMAIL_VERIFICATION
) => {
  return prisma.otpVerification.findFirst({
    where: {
      email,
      type,
      isUsed: false,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const markOtpUsed = async (id: string) => {
  return prisma.otpVerification.update({
    where: { id },
    data: {
      isUsed: true,
    },
  });
};

export const incrementOtpAttempts = async (id: string) => {
  return prisma.otpVerification.update({
    where: { id },
    data: {
      attempts: {
        increment: 1,
      },
    },
  });
};

export const invalidatePreviousOtps = async (
  email: string,
  type: OtpType = OtpType.EMAIL_VERIFICATION
) => {
  return prisma.otpVerification.updateMany({
    where: {
      email,
      type,
      isUsed: false,
    },
    data: {
      isUsed: true,
    },
  });
};
