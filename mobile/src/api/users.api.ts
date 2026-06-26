import { apiClient } from './client';

/** POST /users/fcm-token 🔒 — register the caller's device token for push. */
export async function registerFcmToken(token: string): Promise<void> {
  await apiClient.post('/users/fcm-token', { token });
}
