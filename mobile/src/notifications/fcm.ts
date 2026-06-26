import {
  getMessaging,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
  getInitialNotification,
  requestPermission,
  AuthorizationStatus,
  type FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import { registerFcmToken } from '../api/users.api';
import { navigateToPost } from './navigationRef';

export type RemoteMessage = FirebaseMessagingTypes.RemoteMessage;

const messaging = () => getMessaging();

/** Ask the OS for notification permission (Android 13+ shows the POST_NOTIFICATIONS prompt). */
export async function requestPushPermission(): Promise<boolean> {
  const status = await requestPermission(messaging());
  return (
    status === AuthorizationStatus.AUTHORIZED || status === AuthorizationStatus.PROVISIONAL
  );
}

/** Fetch the current FCM token and register it with the backend. */
export async function registerDeviceToken(): Promise<void> {
  const token = await getToken(messaging());
  if (token) await registerFcmToken(token);
}

/** Re-register whenever FCM rotates the token. Returns an unsubscribe fn. */
export function subscribeTokenRefresh(): () => void {
  return onTokenRefresh(messaging(), (token) => {
    void registerFcmToken(token).catch(() => {
      /* a failed re-register shouldn't crash anything */
    });
  });
}

/** Foreground messages (no system notification is shown automatically). */
export function subscribeForeground(handler: (message: RemoteMessage) => void): () => void {
  return onMessage(messaging(), (message) => handler(message));
}

/**
 * Deep-link notification taps to the relevant post. Handles both the
 * background→foreground tap and the cold/quit start. Returns an unsubscribe fn
 * for the background→foreground listener.
 */
export function wireNotificationTaps(): () => void {
  const unsubscribe = onNotificationOpenedApp(messaging(), (message) => {
    navigateToPost(postIdOf(message));
  });

  // App opened from a quit state by tapping a notification.
  void getInitialNotification(messaging()).then((message) => {
    if (message) navigateToPost(postIdOf(message));
  });

  return unsubscribe;
}

function postIdOf(message: RemoteMessage | null): string | undefined {
  const id = message?.data?.postId;
  return typeof id === 'string' ? id : undefined;
}
