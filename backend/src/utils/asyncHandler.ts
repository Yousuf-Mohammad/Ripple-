import type { NextFunction, Request, Response, RequestHandler } from 'express';

/**
 * Wrap an async route handler so any thrown error / rejected promise is
 * forwarded to Express's error pipeline (and thus the central errorHandler).
 */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
