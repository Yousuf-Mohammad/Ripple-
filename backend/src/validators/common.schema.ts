import { z } from 'zod';
import { isValidObjectId } from 'mongoose';

/**
 * Validates a route `:id` param as a Mongo ObjectId. Used via
 * `validate(idParamSchema, 'params')` so a malformed id returns a 422 in the
 * standard envelope before any query runs (avoids Mongoose cast → 500; §8).
 */
export const idParamSchema = z.object({
  id: z.string().refine(isValidObjectId, 'Invalid id'),
});
