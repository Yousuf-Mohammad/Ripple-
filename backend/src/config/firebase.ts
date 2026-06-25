import { initializeApp, cert } from 'firebase-admin/app';
import { getMessaging as getFirebaseMessaging, type Messaging } from 'firebase-admin/messaging';
import { env, hasFirebaseConfig } from './env';

let messaging: Messaging | null = null;

/**
 * Initialize Firebase Admin from env credentials.
 *
 * If credentials are absent this is a non-fatal no-op: the server boots normally
 * with FCM disabled (push off). Called once from `server.ts` at bootstrap.
 */
export function initFirebase(): void {
  if (!hasFirebaseConfig) {
    console.warn('[firebase] No credentials — FCM disabled (push off)');
    return;
  }

  try {
    const app = initializeApp({
      credential: cert({
        projectId: env.FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        privateKey: env.FIREBASE_PRIVATE_KEY, // env.ts already turned literal \n into newlines
      }),
    });
    messaging = getFirebaseMessaging(app);
    console.log('[firebase] admin initialized — FCM enabled');
  } catch (err) {
    // Bad/placeholder credentials must not crash boot — disable FCM and continue.
    messaging = null;
    console.error(
      '[firebase] init failed — FCM disabled (check FIREBASE_* credentials):',
      err instanceof Error ? err.message : err,
    );
  }
}

/**
 * The messaging client, or `null` when FCM is disabled (no credentials).
 * Callers must no-op when this returns null.
 */
export function getMessaging(): Messaging | null {
  return messaging;
}
