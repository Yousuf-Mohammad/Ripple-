import { z } from 'zod';

export const fcmTokenSchema = z.object({
  token: z.string().trim().min(1, 'token is required'),
});

export type FcmTokenInput = z.infer<typeof fcmTokenSchema>;
