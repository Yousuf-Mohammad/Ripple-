import { z } from 'zod';

export const createPostSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, 'Post text is required')
    .max(500, 'Post text must be at most 500 characters'),
});

// Only the username filter is validated here; page/limit are clamped by
// getPagination (utils/pagination.ts) so we don't duplicate that logic.
export const feedQuerySchema = z
  .object({
    username: z.string().trim().toLowerCase().optional(),
  })
  .passthrough();

export type CreatePostInput = z.infer<typeof createPostSchema>;
