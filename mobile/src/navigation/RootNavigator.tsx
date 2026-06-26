import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuth } from '../auth/useAuth';
import { colors } from '../theme';
import { AppStack } from './AppStack';
import { AuthStack } from './AuthStack';

/**
 * Routes between the Auth and App stacks based on session status. While the
 * stored token is being validated (`loading`) we show a splash spinner.
 */
export function RootNavigator() {
  const { status } = useAuth();

  if (status === 'loading') {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return status === 'authed' ? <AppStack /> : <AuthStack />;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
});
