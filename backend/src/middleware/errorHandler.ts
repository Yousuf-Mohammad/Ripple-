import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';
import { isProduction } from '../config/env';

interface ErrorBody {
  code: string;
  message: string;
  details: unknown;
}

/**
 * Central error handler — the LAST middleware mounted. Converts any error into
 * the standard envelope: { error: { code, message, details } }.
 *
 * - ApiError      -> its own statusCode/code/message/details
 * - ZodError      -> 422 VALIDATION_ERROR with field details
 * - anything else -> 500 INTERNAL_ERROR (generic; no stack/message leak in prod)
 */
// Express needs the 4-arg signature (incl. _next) to treat this as an error handler.
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  let statusCode = 500;
  let body: ErrorBody = {
    code: 'INTERNAL_ERROR',
    message: 'Something went wrong',
    details: [],
  };

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    body = { code: err.code, message: err.message, details: err.details ?? [] };
  } else if (err instanceof ZodError) {
    statusCode = 422;
    body = {
      code: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      details: err.issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message,
        code: i.code,
      })),
    };
  } else if (!isProduction) {
    // In non-prod, surface the real message to aid debugging (never in prod).
    body.message = err instanceof Error ? err.message : String(err);
  }

  // Log unexpected (5xx) errors server-side regardless of environment.
  if (statusCode >= 500) {
    console.error('[error]', err);
  }

  res.status(statusCode).json({ error: body });
};
