import { hasFirebaseConfig } from './env';

/**
 * Firebase Admin initialization — STUB until phase P4.
 *
 * In P0 we only verify whether credentials are configured. If they are absent,
 * this is a no-op and the server boots normally with FCM disabled. The real
 * `firebase-admin` init (and `admin.messaging()` usage) lands with the
 * notification service in P4.
 */
export function initFirebase(): void {
  if (!hasFirebaseConfig) {
    console.warn('[firebase] No Firebase credentials found — FCM disabled (push notifications off)');
    return;
  }

  // Credentials present but real init is deferred to P4.
  console.log('[firebase] Firebase credentials detected — admin init deferred to P4');
}
