import { useCallback, useLayoutEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Post } from '../api/types';
import { useAuth } from '../auth/useAuth';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';
import { PostCard } from '../components/PostCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { UsernameFilter } from '../components/UsernameFilter';
import { useFeedContext } from '../feed/FeedContext';
import { useToggleLike } from '../hooks/useToggleLike';
import type { AppStackParamList } from '../navigation/types';
import { colors, layout, spacing } from '../theme';

export function FeedScreen({ navigation }: NativeStackScreenProps<AppStackParamList, 'Feed'>) {
  const { logout } = useAuth();
  const {
    posts,
    status,
    error,
    refreshing,
    loadingMore,
    refresh,
    loadMore,
    filterText,
    setFilterText,
    debouncedUsername,
  } = useFeedContext();
  const toggleLike = useToggleLike();

  // Stable callbacks so the memoized PostCard doesn't re-render needlessly.
  const onToggleLike = useCallback((post: Post) => void toggleLike(post), [toggleLike]);
  const onPressComments = useCallback(
    (post: Post) => navigation.navigate('Comments', { postId: post.id }),
    [navigation],
  );

  // Compose (left) + logout (right) live in the header so the feed body stays clean.
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Pressable
          onPress={() => navigation.navigate('CreatePost')}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Compose post"
        >
          <Ionicons name="create-outline" size={24} color={colors.primary} />
        </Pressable>
      ),
      headerRight: () => (
        <Pressable
          onPress={() => void logout()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Log out"
        >
          <Ionicons name="log-out-outline" size={24} color={colors.text} />
        </Pressable>
      ),
    });
  }, [navigation, logout]);

  const header = <UsernameFilter value={filterText} onChangeText={setFilterText} />;

  const renderBody = () => {
    // First load.
    if (status === 'loading') {
      return (
        <View style={styles.center}>
          {header}
          <ActivityIndicator size="large" color={colors.primary} style={styles.spacer} />
        </View>
      );
    }

    // Initial-load failure.
    if (status === 'error') {
      return (
        <View style={styles.center}>
          {header}
          <View style={styles.spacer}>
            <ErrorBanner message={error} />
            <PrimaryButton label="Retry" onPress={refresh} style={styles.retry} />
          </View>
        </View>
      );
    }

    return (
      <FlatList
        data={posts}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onToggleLike={onToggleLike}
            onPressComments={onPressComments}
          />
        )}
        ListHeaderComponent={header}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon="chatbubbles-outline"
            title={debouncedUsername ? `No posts from @${debouncedUsername}` : 'No posts yet'}
            subtitle={
              debouncedUsername
                ? 'Try a different username.'
                : 'Be the first to make a ripple.'
            }
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator color={colors.primary} style={styles.footer} />
          ) : null
        }
        keyboardShouldPersistTaps="handled"
      />
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.constrain}>{renderBody()}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  // Center + cap width so the feed reads well on tablets (§6.5).
  constrain: {
    flex: 1,
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
  },
  listContent: {
    padding: spacing.lg,
    gap: spacing.md,
    flexGrow: 1,
  },
  center: {
    flex: 1,
    padding: spacing.lg,
  },
  spacer: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  retry: {
    marginTop: spacing.sm,
  },
  footer: {
    paddingVertical: spacing.lg,
  },
});
