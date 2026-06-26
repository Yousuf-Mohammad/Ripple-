import Constants from 'expo-constants';

/**
 * Resolves the backend API base URL.
 *
 * Priority:
 *   1. EXPO_PUBLIC_API_BASE_URL (inlined at build time)
 *   2. app.config.ts `extra.apiBaseUrl`
 *   3. Android-emulator fallback
 *
 * No `/api` prefix — routes are mounted at root (see backend src/routes/index.ts).
 */
const extra = (Constants.expoConfig?.extra ?? {}) as { apiBaseUrl?: string };

export const env = {
  apiBaseUrl:
    process.env.EXPO_PUBLIC_API_BASE_URL ?? extra.apiBaseUrl ?? 'http://10.0.2.2:4000',
} as const;
