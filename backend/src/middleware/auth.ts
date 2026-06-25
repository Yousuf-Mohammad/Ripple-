import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';
import { verifyToken } from '../utils/jwt';

/**
 * Require a valid `Authorization: Bearer <token>`. On success attaches
 * `req.user = { id }` (id-only; controllers load the full user when needed).
 */
export function auth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Missing or malformed Authorization header');
  }

  const token = header.slice('Bearer '.length).trim();
  if (!token) {
    throw ApiError.unauthorized('Missing bearer token');
  }

  try {
    const { sub } = verifyToken(token);
    req.user = { id: sub };
    next();
  } catch {
    throw ApiError.unauthorized('Invalid or expired token', 'INVALID_TOKEN');
  }
}
