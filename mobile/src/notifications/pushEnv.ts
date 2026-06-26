import Constants, { ExecutionEnvironment } from 'expo-constants';

/**
 * Native Firebase messaging only exists in a dev/standalone build — NOT in Expo
 * Go (§4.1). When running in Expo Go we skip all FCM work so the app still
 * bundles and runs (push is simply disabled). On a real build this is `true`.
 */
export const isPushSupported =
  Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;
