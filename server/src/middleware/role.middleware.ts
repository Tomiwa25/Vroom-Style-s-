import { NextFunction, Request, Response } from "express";
import { Role } from "@prisma/client";

export const authorizeRoles = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "Permission denied",
      });
      return;
    }

    next();
  };
};

export const requireVerified = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return;
  }

  if (req.user.isVerified === false) {
    res.status(403).json({
      success: false,
      message: "Email verification required. Please verify your account with the 6-digit OTP code.",
      requiresVerification: true,
    });
    return;
  }

  next();
};