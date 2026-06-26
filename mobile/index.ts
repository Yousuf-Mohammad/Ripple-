import { registerRootComponent } from 'expo';

import App from './App';
import { isPushSupported } from './src/notifications/pushEnv';

// Background / quit-state message handler. Must be registered at the true entry
// point, outside the React tree (§6.4). Loaded lazily and only on a real build —
// in Expo Go the native Firebase module doesn't exist (§4.1). Wrapped in
// try/catch so a Firebase init hiccup can never crash app startup (§9).
if (isPushSupported) {
  try {
    const {
      getMessaging,
      setBackgroundMessageHandler,
    } = require('@react-native-firebase/messaging');
    setBackgroundMessageHandler(getMessaging(), async (remoteMessage: { messageId?: string }) => {
      console.log('[fcm] background message', remoteMessage?.messageId);
    });
  } catch (err) {
    console.warn('[fcm] background handler setup failed', err);
  }
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
