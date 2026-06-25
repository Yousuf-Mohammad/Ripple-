import { Router } from 'express';
import { authLimiter } from '../middleware/rateLimit';
import { validate } from '../middleware/validate';
import { auth } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { signup, login, me } from '../controllers/auth.controller';
import { signupSchema, loginSchema } from '../validators/auth.schema';

const router = Router();

// Tight rate limit on all auth routes.
router.use(authLimiter);

router.post('/signup', validate(signupSchema), asyncHandler(signup));
router.post('/login', validate(loginSchema), asyncHandler(login));
router.get('/me', auth, asyncHandler(me));

export default router;
