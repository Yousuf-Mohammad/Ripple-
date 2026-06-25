import { Router } from 'express';
import { auth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/asyncHandler';
import { createPost, getFeed } from '../controllers/post.controller';
import { toggleLike, addComment, getComments } from '../controllers/interaction.controller';
import { createPostSchema, feedQuerySchema } from '../validators/post.schema';
import { createCommentSchema } from '../validators/comment.schema';
import { idParamSchema } from '../validators/common.schema';

const router = Router();

// auth first so unauthenticated requests 401 before validation runs.
router.post('/', auth, validate(createPostSchema), asyncHandler(createPost));
router.get('/', auth, validate(feedQuerySchema, 'query'), asyncHandler(getFeed));

// Interactions (P3).
router.post('/:id/like', auth, validate(idParamSchema, 'params'), asyncHandler(toggleLike));
router.post(
  '/:id/comment',
  auth,
  validate(idParamSchema, 'params'),
  validate(createCommentSchema),
  asyncHandler(addComment),
);
router.get(
  '/:id/comments',
  auth,
  validate(idParamSchema, 'params'),
  validate(feedQuerySchema, 'query'),
  asyncHandler(getComments),
);

export default router;
