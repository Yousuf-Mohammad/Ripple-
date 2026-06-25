import rateLimit, { type Options } from 'express-rate-limit';

/**
 * Standardized rate-limit error in the project envelope.
 */
const limitHandler: Options['handler'] = (_req, res) => {
  res.status(429).json({
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many requests, please try again later.',
      details: [],
    },
  });
};

/** Lenient limiter applied to all routes. */
export const defaultLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: limitHandler,
});

/** Stricter limiter for auth routes (used from P1). */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: limitHandler,
});
