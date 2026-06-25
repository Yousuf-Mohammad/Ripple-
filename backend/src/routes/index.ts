import { Router } from 'express';

const router = Router();

// Health check — unauthenticated.
router.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Feature routers attach here as later phases land:
//   router.use('/auth', authRoutes);    // P1
//   router.use('/users', userRoutes);   // P4
//   router.use('/posts', postRoutes);   // P2/P3

export default router;
