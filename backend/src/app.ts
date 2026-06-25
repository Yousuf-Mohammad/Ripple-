import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env';
import routes from './routes';
import { defaultLimiter } from './middleware/rateLimit';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Security headers.
app.use(helmet());

// CORS — restrict to the configured allowlist if provided, else permissive (dev).
const allowedOrigins = env.CORS_ORIGIN?.split(',')
  .map((o) => o.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: allowedOrigins && allowedOrigins.length > 0 ? allowedOrigins : true,
  }),
);

// Body parsing with a sane size limit.
app.use(express.json({ limit: '100kb' }));

// Baseline rate limiting for all routes.
app.use(defaultLimiter);

// Routes.
app.use('/', routes);

// 404 + central error handler (must be last).
app.use(notFound);
app.use(errorHandler);

export default app;
