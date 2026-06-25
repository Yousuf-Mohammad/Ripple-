import { Router } from 'express';
import authRoutes from './auth.routes';

const router = Router();

// Health check — unauthenticated.
router.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Feature routers.
router.use('/auth', authRoutes);
// router.use('/users', userRoutes);   // P4
// router.use('/posts', postRoutes);   // P2/P3

export default router;
