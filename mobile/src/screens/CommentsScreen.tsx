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
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { addComment } from '../api/posts.api';
import { ApiError } from '../api/types';
import { CommentItem } from '../components/CommentItem';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';
import { PrimaryButton } from '../components/PrimaryButton';
import { useFeedContext } from '../feed/FeedContext';
import { useComments } from '../hooks/useComments';
import type { AppStackParamList } from '../navigation/types';
import { colors, control, fontSize, layout, lineHeight, radius, spacing } from '../theme';

const MAX_LEN = 300;

export function CommentsScreen({
  route,
}: NativeStackScreenProps<AppStackParamList, 'Comments'>) {
  const { postId } = route.params;
  const { posts, updatePost } = useFeedContext();
  const post = posts.find((p) => p.id === postId);
  const { comments, status, error, loadingMore, refresh, loadMore, append } =
    useComments(postId);

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
      <Text style={styles.postAuthor}>@{post.author.username}</Text>
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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.constrain}>
          {renderList()}

          {sendError ? (
            <View style={styles.bannerWrap}>
              <ErrorBanner message={sendError} />
            </View>
          ) : null}

          <View style={styles.composer}>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder="Add a comment…"
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={MAX_LEN}
              editable={!sending}
            />
            <Pressable
              style={[styles.send, !canSend && styles.sendDisabled]}
              onPress={onSend}
              disabled={!canSend}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel="Send comment"
            >
              {sending ? (
                <ActivityIndicator color={colors.textInverse} size="small" />
              ) : (
                <Ionicons name="send" size={18} color={colors.textInverse} />
              )}
            </Pressable>
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
    gap: spacing.sm,
    flexGrow: 1,
  },
  postHeader: {
    backgroundColor: colors.primaryMuted,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  postAuthor: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  postText: {
    fontSize: fontSize.md,
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
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  input: {
    flex: 1,
    maxHeight: control.inputMaxHeight,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    color: colors.text,
  },
  send: {
    width: control.size,
    height: control.size,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: {
    opacity: 0.5,
  },
});
