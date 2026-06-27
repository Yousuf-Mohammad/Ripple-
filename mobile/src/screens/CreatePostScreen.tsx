import { useLayoutEffect, useState } from 'react';
import {
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
import { createPost } from '../api/posts.api';
import { ApiError } from '../api/types';
import { useAuth } from '../auth/useAuth';
import { Avatar } from '../components/Avatar';
import { ErrorBanner } from '../components/ErrorBanner';
import { useFeedContext } from '../feed/FeedContext';
import type { AppStackParamList } from '../navigation/types';
import { colors, fontFamily, fontSize, layout, lineHeight, radius, spacing } from '../theme';

const MAX_LEN = 500;

export function CreatePostScreen({
  navigation,
}: NativeStackScreenProps<AppStackParamList, 'CreatePost'>) {
  const { user } = useAuth();
  const { prependPost, debouncedUsername } = useFeedContext();
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const len = text.length;
  const overLimit = len > MAX_LEN;
  const disabled = submitting || text.trim().length === 0 || overLimit;

  const onSubmit = async () => {
    if (disabled) return;
    setError(null);
    setSubmitting(true);
    try {
      const post = await createPost(text.trim());
      // Only prepend when the post will actually show under the current view.
      const filterShowsIt =
        !debouncedUsername || debouncedUsername === post.author.username.toLowerCase();
      if (filterShowsIt) prependPost(post);
      navigation.goBack();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not post. Please try again.');
      setSubmitting(false); // keep the screen + typed text on failure
    }
  };

  // Facebook-style: the "Post" action lives in the header (top-right) so the soft
  // keyboard can never cover it.
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={onSubmit}
          disabled={disabled}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Post"
          accessibilityState={{ disabled, busy: submitting }}
        >
          <Text style={[styles.postAction, disabled && styles.postActionDisabled]}>
            {submitting ? 'Posting…' : 'Post'}
          </Text>
        </Pressable>
      ),
    });
    // onSubmit closes over text/disabled/submitting; re-run when those change.
  }, [navigation, disabled, submitting, text]);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.constrain}>
          {error ? (
            <View style={styles.bannerWrap}>
              <ErrorBanner message={error} />
            </View>
          ) : null}

          <View style={styles.authorRow}>
            <Avatar username={user?.username ?? '?'} size={44} />
            <View style={styles.authorText}>
              <Text style={styles.authorName}>@{user?.username ?? 'you'}</Text>
              <View style={styles.audience}>
                <Ionicons name="globe-outline" size={13} color={colors.textMuted} />
                <Text style={styles.audienceText}>Public</Text>
              </View>
            </View>
          </View>

          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder={`What's on your mind, ${user?.username ?? 'friend'}?`}
            placeholderTextColor={colors.textSubtle}
            multiline
            autoFocus
            textAlignVertical="top"
            editable={!submitting}
            maxLength={MAX_LEN + 50} // allow a little overflow so the counter can warn
          />

          <Text style={[styles.counter, overLimit && styles.counterOver]}>
            {len}/{MAX_LEN}
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  constrain: {
    flex: 1,
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  bannerWrap: {
    marginBottom: spacing.md,
  },
  postAction: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.bold,
    color: colors.primary,
  },
  postActionDisabled: {
    color: colors.textSubtle,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  authorText: {
    gap: 2,
  },
  authorName: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.semibold,
    color: colors.text,
  },
  audience: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  audienceText: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.medium,
    color: colors.textMuted,
  },
  // Borderless, large — the Facebook composer feel.
  input: {
    flex: 1,
    fontSize: fontSize.xl,
    fontFamily: fontFamily.regular,
    color: colors.text,
    lineHeight: lineHeight.lg + 4,
    padding: 0,
  },
  counter: {
    alignSelf: 'flex-end',
    paddingVertical: spacing.sm,
    fontSize: fontSize.sm,
    fontFamily: fontFamily.medium,
    color: colors.textSubtle,
  },
  counterOver: {
    color: colors.danger,
  },
});
