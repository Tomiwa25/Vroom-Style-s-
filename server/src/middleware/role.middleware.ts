import { NextFunction, Request, Response } from "express";
import { Role } from "../generated/prisma/client.js";

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