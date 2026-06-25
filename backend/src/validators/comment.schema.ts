import { z } from 'zod';

export const createCommentSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, 'Comment text is required')
    .max(300, 'Comment text must be at most 300 characters'),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
