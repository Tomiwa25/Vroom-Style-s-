import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import type { AuthenticatedUser } from "../types/auth.js";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    res.status(500).json({
      success: false,
      message: "Server configuration error: JWT_SECRET missing",
    });
    return;
  }

  const authorization = req.headers.authorization;

  if (!authorization) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return;
  }

  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    res.status(401).json({
      success: false,
      message: "Invalid authorization format",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Unauthorized: invalid or expired token",
    });
  }
};
