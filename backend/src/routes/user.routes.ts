import { Router } from 'express';
import { auth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/asyncHandler';
import { registerFcmToken } from '../controllers/user.controller';
import { fcmTokenSchema } from '../validators/user.schema';

const router = Router();

router.post('/fcm-token', auth, validate(fcmTokenSchema), asyncHandler(registerFcmToken));

export default router;
