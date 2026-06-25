import { Router } from 'express';
import authRoutes from './auth.routes';
import postRoutes from './post.routes';

const router = Router();

// Health check — unauthenticated.
router.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Feature routers.
router.use('/auth', authRoutes);
router.use('/posts', postRoutes);
// router.use('/users', userRoutes);   // P4

export default router;
