import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { ZodError, type ZodTypeAny } from 'zod';
import { ApiError } from '../utils/ApiError';

type ValidationTarget = 'body' | 'params' | 'query';

/**
 * Validate a request segment against a zod schema. On success, the parsed
 * (and coerced) value replaces the original. On failure, throws a 422
 * ApiError carrying field-level details.
 *
 * Usage: router.post('/posts', validate(createPostSchema), controller)
 */
export const validate =
  (schema: ZodTypeAny, target: ValidationTarget = 'body'): RequestHandler =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      return next(ApiError.validation('Request validation failed', formatZodError(result.error)));
    }
    // Replace with parsed data so downstream handlers get typed/coerced values.
    req[target] = result.data;
    return next();
  };

function formatZodError(error: ZodError) {
  return error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
    code: issue.code,
  }));
}
