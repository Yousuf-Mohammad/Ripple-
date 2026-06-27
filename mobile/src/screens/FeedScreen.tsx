import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Post } from '../api/types';
import { useAuth } from '../auth/useAuth';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';
import { FeedSearchBar } from '../components/FeedSearchBar';
import { MakeRippleTrigger } from '../components/MakeRippleTrigger';
import { PostCard } from '../components/PostCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { UserMenu, type AnchorRect } from '../components/UserMenu';
import { useFeedContext } from '../feed/FeedContext';
import { useToggleLike } from '../hooks/useToggleLike';
import type { AppStackParamList } from '../navigation/types';
import { colors, fontFamily, fontSize, layout, spacing } from '../theme';

export function FeedScreen({ navigation }: NativeStackScreenProps<AppStackParamList, 'Feed'>) {
  const { user, logout } = useAuth();
  const {
    posts,
    status,
    error,
    refreshing,
    loadingMore,
    refresh,
    loadMore,
    setFilterText,
    debouncedUsername,
  } = useFeedContext();
  const toggleLike = useToggleLike();

  const [searching, setSearching] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const accountRef = useRef<View>(null);
  const [anchor, setAnchor] = useState<AnchorRect | null>(null);

  // Measure the trigger's screen rect so the dropdown drops straight under it.
  const openMenu = useCallback(() => {
    accountRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setMenuOpen(true);
    });
  }, []);

  // Stable callbacks so the memoized PostCard doesn't re-render needlessly.
  const onToggleLike = useCallback((post: Post) => void toggleLike(post), [toggleLike]);
  const onPressComments = useCallback(
    (post: Post) => navigation.navigate('Comments', { postId: post.id }),
    [navigation],
  );

  // Header: search lives on the left (tap to expand into the filter field), the
  // account dropdown trigger on the right. Reconfigured only when `searching`
  // toggles — never per keystroke — so the search field keeps focus.
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: searching ? () => <FeedSearchBar /> : 'Ripple',
      headerLeft: () =>
        searching ? (
          <Pressable
            onPress={() => {
              setSearching(false);
              setFilterText('');
              Keyboard.dismiss();
            }}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Close search"
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
        ) : (
          <Pressable
            onPress={() => setSearching(true)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Search by username"
          >
            <Ionicons name="search" size={22} color={colors.text} />
          </Pressable>
        ),
      headerRight: () => (
        <Pressable
          ref={accountRef}
          style={styles.account}
          onPress={openMenu}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Account menu, @${user?.username ?? 'you'}`}
        >
          <Text style={styles.accountText} numberOfLines={1}>
            @{user?.username ?? 'you'}
          </Text>
          <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
        </Pressable>
      ),
    });
  }, [navigation, searching, user?.username, setFilterText, openMenu]);

  const composer = (
    <MakeRippleTrigger
      username={user?.username ?? '?'}
      onPress={() => navigation.navigate('CreatePost')}
    />
  );

  const renderBody = () => {
    // First load.
    if (status === 'loading') {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    // Initial-load failure.
    if (status === 'error') {
      return (
        <View style={styles.center}>
          <ErrorBanner message={error} />
          <PrimaryButton label="Retry" onPress={refresh} style={styles.retry} />
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
        ListHeaderComponent={composer}
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
      <UserMenu
        visible={menuOpen}
        anchor={anchor}
        onClose={() => setMenuOpen(false)}
        onLogout={() => void logout()}
      />
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
  account: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    maxWidth: 160,
  },
  accountText: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.semibold,
    color: colors.text,
  },
  listContent: {
    padding: spacing.lg,
    gap: spacing.md,
    flexGrow: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  retry: {
    marginTop: spacing.sm,
  },
  footer: {
    paddingVertical: spacing.lg,
  },
});
