import { View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { InAppNotice } from '../components/InAppNotice';
import { FeedProvider } from '../feed/FeedContext';
import { usePushNotifications } from '../notifications/usePushNotifications';
import { CommentsScreen } from '../screens/CommentsScreen';
import { CreatePostScreen } from '../screens/CreatePostScreen';
import { FeedScreen } from '../screens/FeedScreen';
import { colors } from '../theme';
import type { AppStackParamList } from './types';

const Stack = createNativeStackNavigator<AppStackParamList>();

/** Shown when logged in. Feed is the root; CreatePost / Comments push on top. */
export function AppStack() {
  // Push runs only while authed; surfaces foreground messages as a banner.
  const { notice, dismiss } = usePushNotifications();

  return (
    <FeedProvider>
      <View style={styles.flex}>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
          }}
        >
          <Stack.Screen name="Feed" component={FeedScreen} options={{ title: 'Ripple' }} />
          <Stack.Screen
            name="CreatePost"
            component={CreatePostScreen}
            options={{ title: 'New post' }}
          />
          <Stack.Screen
            name="Comments"
            component={CommentsScreen}
            options={{ title: 'Comments', presentation: 'modal' }}
          />
        </Stack.Navigator>
        <InAppNotice message={notice} onDismiss={dismiss} />
      </View>
    </FeedProvider>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
