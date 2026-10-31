import type { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Higher-order controller wrapper that catches rejected promises or thrown errors
 * and forwards them to the Gateway Error Boundary middleware via next(err).
 * Eliminates repetitive try/catch boilerplate across controllers.
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown> | unknown
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
