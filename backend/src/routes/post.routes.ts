import { Router } from 'express';
import { auth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/asyncHandler';
import { createPost, getFeed } from '../controllers/post.controller';
import { createPostSchema, feedQuerySchema } from '../validators/post.schema';

const router = Router();

// auth first so unauthenticated requests 401 before validation runs.
router.post('/', auth, validate(createPostSchema), asyncHandler(createPost));
router.get('/', auth, validate(feedQuerySchema, 'query'), asyncHandler(getFeed));

export default router;
