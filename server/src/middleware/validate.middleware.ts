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
        // express.json() leaves req.body undefined when the client sends no
        // body at all (no Content-Type, or Content-Length: 0). That is a
        // legitimate request — e.g. POST /api/orders checking out from the
        // server-side cart — so parse it as an empty object instead of
        // failing the schema with "expected object, received undefined".
        req.body = schemas.body.parse(req.body ?? {});
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
