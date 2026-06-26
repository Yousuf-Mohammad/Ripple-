import { useCallback, useEffect, useState } from 'react';
import type { RemoteMessage } from './fcm';
import { isPushSupported } from './pushEnv';

export interface PushState {
  /** Latest foreground message, surfaced as an in-app banner. */
  notice: RemoteMessage | null;
  dismiss: () => void;
}

/**
 * Drives push for an authenticated session: requests permission, registers the
 * device token, re-registers on refresh, deep-links taps, and surfaces
 * foreground messages as an in-app banner. Mounted inside the App stack so it
 * only runs when logged in; all subscriptions are cleaned up on unmount.
 *
 * In Expo Go (`!isPushSupported`) this is a no-op — the native Firebase module
 * isn't present, so `./fcm` is required lazily only on a real build (§4.1).
 */
export function usePushNotifications(): PushState {
  const [notice, setNotice] = useState<RemoteMessage | null>(null);
  const dismiss = useCallback(() => setNotice(null), []);

  useEffect(() => {
    if (!isPushSupported) return;

    let active = true;
    let cleanup: (() => void) | undefined;

    // Any native Firebase failure must degrade to "no push", never crash (§9).
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fcm = require('./fcm') as typeof import('./fcm');

      (async () => {
        const granted = await fcm.requestPushPermission().catch(() => false);
        if (!active || !granted) return;
        await fcm.registerDeviceToken().catch(() => {
          /* registration failure shouldn't break the app */
        });
      })();

      const unsubRefresh = fcm.subscribeTokenRefresh();
      const unsubForeground = fcm.subscribeForeground((message) => {
        if (active) setNotice(message);
      });
      const unsubTaps = fcm.wireNotificationTaps();

      cleanup = () => {
        unsubRefresh();
        unsubForeground();
        unsubTaps();
      };
    } catch (err) {
      console.warn('[fcm] push setup failed', err);
    }

    return () => {
      active = false;
      cleanup?.();
    };
  }, []);

  return { notice, dismiss };
}
