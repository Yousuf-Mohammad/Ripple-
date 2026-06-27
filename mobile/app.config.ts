import type { ExpoConfig, ConfigContext } from 'expo/config';

/**
 * Ripple — Expo config.
 *
 * The API base URL is read from EXPO_PUBLIC_API_BASE_URL at build/start time and
 * exposed via `extra.apiBaseUrl` (see src/config/env.ts). Dev hosts:
 *   - Android emulator → http://10.0.2.2:4000
 *   - Physical device  → http://<your-LAN-IP>:4000
 *
 * Native Firebase messaging (P10) requires the @react-native-firebase plugins +
 * google-services.json and a dev/EAS build — push will NOT work in Expo Go (§4.1).
 * `usesCleartextTraffic` lets the installed APK reach the backend over plain http
 * on the LAN (Android blocks cleartext by default).
 */
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Ripple',
  slug: 'ripple',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  ios: {
    supportsTablet: true,
  },
  android: {
    package: 'com.ripple.com',
    // Resize the app window when the soft keyboard opens (native adjustResize) so
    // KeyboardAvoidingView can keep the comment composer / actions visible.
    softwareKeyboardLayoutMode: 'resize',
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-secure-store',
    '@react-native-firebase/app',
    '@react-native-firebase/messaging',
    ['expo-build-properties', { android: { usesCleartextTraffic: true } }],
  ],
  extra: {
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://10.0.2.2:4000',
    eas: {
      projectId: 'ae5db667-09bd-4899-ba2e-afc441c93c6d',
    },
  },
});
