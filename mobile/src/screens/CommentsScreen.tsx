import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { addComment } from '../api/posts.api';
import { ApiError } from '../api/types';
import { useAuth } from '../auth/useAuth';
import { Avatar } from '../components/Avatar';
import { CommentItem } from '../components/CommentItem';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';
import { PrimaryButton } from '../components/PrimaryButton';
import { useFeedContext } from '../feed/FeedContext';
import { useComments } from '../hooks/useComments';
import type { AppStackParamList } from '../navigation/types';
import {
  colors,
  control,
  fontFamily,
  fontSize,
  layout,
  lineHeight,
  radius,
  spacing,
} from '../theme';

const MAX_LEN = 300;

export function CommentsScreen({
  route,
}: NativeStackScreenProps<AppStackParamList, 'Comments'>) {
  const { postId } = route.params;
  const { user } = useAuth();
  const { posts, updatePost } = useFeedContext();
  const post = posts.find((p) => p.id === postId);
  const { comments, status, error, loadingMore, refresh, loadMore, append } =
    useComments(postId);
  // Offset the keyboard-avoiding view by the header so the composer rises to sit
  // exactly above the keyboard (works with Android adjustResize too).
  const headerHeight = useHeaderHeight();

  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const canSend = text.trim().length > 0 && text.length <= MAX_LEN && !sending;

  const onSend = async () => {
    if (!canSend) return;
    setSendError(null);
    setSending(true);
    try {
      const comment = await addComment(postId, text.trim());
      append(comment);
      updatePost(postId, { commentCount: (post?.commentCount ?? 0) + 1 });
      setText('');
    } catch (e) {
      setSendError(e instanceof ApiError ? e.message : 'Could not add comment.');
    } finally {
      setSending(false);
    }
  };

  const listHeader = post ? (
    <View style={styles.postHeader}>
      <View style={styles.postAuthorRow}>
        <Avatar username={post.author.username} size={40} />
        <Text style={styles.postAuthor}>@{post.author.username}</Text>
      </View>
      <Text style={styles.postText}>{post.text}</Text>
    </View>
  ) : null;

  const renderList = () => {
    if (status === 'loading') {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }
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
        data={comments}
        keyExtractor={(c) => c.id}
        renderItem={({ item }) => <CommentItem comment={item} />}
        ListHeaderComponent={listHeader}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon="chatbubble-ellipses-outline"
            title="No comments yet"
            subtitle="Be the first to reply."
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
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={headerHeight}
      >
        <View style={styles.constrain}>
          {renderList()}

          {sendError ? (
            <View style={styles.bannerWrap}>
              <ErrorBanner message={sendError} />
            </View>
          ) : null}

          {/* Facebook-style composer: avatar + rounded pill with an inline send. */}
          <View style={styles.composer}>
            <Avatar username={user?.username ?? '?'} size={32} />
            <View style={styles.pill}>
              <TextInput
                style={styles.input}
                value={text}
                onChangeText={setText}
                placeholder="Write a comment…"
                placeholderTextColor={colors.textSubtle}
                multiline
                maxLength={MAX_LEN}
                editable={!sending}
              />
              <Pressable
                style={({ pressed }) => [
                  styles.send,
                  !canSend && styles.sendDisabled,
                  pressed && canSend && styles.sendPressed,
                ]}
                onPress={onSend}
                disabled={!canSend}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel="Send comment"
              >
                {sending ? (
                  <ActivityIndicator color={colors.primary} size="small" />
                ) : (
                  <Ionicons
                    name="send"
                    size={18}
                    color={canSend ? colors.primary : colors.textSubtle}
                  />
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  flex: {
    flex: 1,
  },
  constrain: {
    flex: 1,
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
  },
  listContent: {
    padding: spacing.lg,
    gap: spacing.lg,
    flexGrow: 1,
  },
  postHeader: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  postAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  postAuthor: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.semibold,
    color: colors.text,
  },
  postText: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.regular,
    color: colors.text,
    lineHeight: lineHeight.md,
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
  bannerWrap: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    minHeight: control.size,
    maxHeight: control.inputMaxHeight,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    fontFamily: fontFamily.regular,
    color: colors.text,
    maxHeight: control.inputMaxHeight - spacing.sm * 2,
  },
  send: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: (control.size - 36) / 2,
  },
  sendPressed: {
    opacity: 0.5,
  },
  sendDisabled: {
    opacity: 1, // icon already greys out via color; keep the tap target stable
  },
});
