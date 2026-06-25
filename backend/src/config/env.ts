import 'dotenv/config';
import { z } from 'zod';

/**
 * Environment schema. Required vars must be present for the server to boot.
 * Firebase vars are optional until push notifications (phase P4).
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // Optional comma-separated CORS allowlist (empty => permissive in dev).
  CORS_ORIGIN: z.string().optional(),

  // Firebase Admin (optional in P0).
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z
    .string()
    .optional()
    // The env keeps literal "\n"; turn them into real newlines.
    .transform((key) => key?.replace(/\\n/g, '\n')),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
  // Fail fast with a readable message; do not start with invalid config.
  console.error(`\n[env] Invalid environment configuration:\n${issues}\n`);
  process.exit(1);
}

export const env = parsed.data;

/** True when all Firebase Admin credentials are present. */
export const hasFirebaseConfig = Boolean(
  env.FIREBASE_PROJECT_ID && env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY,
);

export const isProduction = env.NODE_ENV === 'production';
