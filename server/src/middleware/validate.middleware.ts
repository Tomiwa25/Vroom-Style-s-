import type { Request, Response, NextFunction, RequestHandler } from "express";
import { z } from "zod";

interface ValidationSchemas {
  body?: z.ZodTypeAny;
  query?: z.ZodTypeAny;
  params?: z.ZodTypeAny;
}

/**
 * Gateway perimeter middleware for request schema validation.
 * Intercepts incoming requests before they reach controllers or business services.
 * Rejects invalid requests early at the gateway boundary.
 */
export const validateRequest = (schemas: ValidationSchemas): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as any;
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as any;
      }
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
