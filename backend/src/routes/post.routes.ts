import { Router } from 'express';
import { auth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/asyncHandler';
import { createPost, getFeed } from '../controllers/post.controller';
import { toggleLike } from '../controllers/interaction.controller';
import { createPostSchema, feedQuerySchema } from '../validators/post.schema';
import { idParamSchema } from '../validators/common.schema';

const router = Router();

// auth first so unauthenticated requests 401 before validation runs.
router.post('/', auth, validate(createPostSchema), asyncHandler(createPost));
router.get('/', auth, validate(feedQuerySchema, 'query'), asyncHandler(getFeed));

// Interactions (P3).
router.post('/:id/like', auth, validate(idParamSchema, 'params'), asyncHandler(toggleLike));

export default router;
