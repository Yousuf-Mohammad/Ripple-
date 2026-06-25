import type { Request, Response } from 'express';
import { User } from '../models/User';
import type { FcmTokenInput } from '../validators/user.schema';

/**
 * POST /users/fcm-token — register the caller's device token for push.
 * `$addToSet` dedupes so re-registering the same token is a no-op (§4.2).
 */
export async function registerFcmToken(req: Request, res: Response): Promise<void> {
  const { token } = req.body as FcmTokenInput;
  await User.updateOne({ _id: req.user!.id }, { $addToSet: { fcmTokens: token } });
  res.json({ success: true });
}
