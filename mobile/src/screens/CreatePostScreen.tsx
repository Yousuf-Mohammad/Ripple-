import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { createPost } from '../api/posts.api';
import { ApiError } from '../api/types';
import { useAuth } from '../auth/useAuth';
import { ErrorBanner } from '../components/ErrorBanner';
import { PrimaryButton } from '../components/PrimaryButton';
import { useFeedContext } from '../feed/FeedContext';
import type { AppStackParamList } from '../navigation/types';
import { colors, fontSize, layout, lineHeight, radius, spacing } from '../theme';

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

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.constrain}>
          <ErrorBanner message={error} />

          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder={`What's rippling, @${user?.username ?? 'you'}?`}
            placeholderTextColor={colors.textMuted}
            multiline
            autoFocus
            textAlignVertical="top"
            editable={!submitting}
            maxLength={MAX_LEN + 50} // allow a little overflow so the counter can warn
          />

          <Text style={[styles.counter, overLimit && styles.counterOver]}>
            {len}/{MAX_LEN}
          </Text>

          <PrimaryButton
            label="Post"
            onPress={onSubmit}
            loading={submitting}
            disabled={disabled}
          />
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
    padding: spacing.lg,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: lineHeight.md,
  },
  counter: {
    alignSelf: 'flex-end',
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  counterOver: {
    color: colors.danger,
  },
});
