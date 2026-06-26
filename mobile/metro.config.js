// Learn more: https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// @react-native-firebase v22+ ships a package `exports` map that Metro's
// exports resolver mishandles ("dist/module/... does not exist"), breaking the
// messaging → app import. Falling back to classic main/module resolution fixes
// it. Safe for the rest of the Expo dependency tree.
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
