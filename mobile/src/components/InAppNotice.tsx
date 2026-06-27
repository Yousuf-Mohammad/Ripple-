import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RemoteMessage } from '../notifications/fcm';
import { navigateToPost } from '../notifications/navigationRef';
import { colors, fontFamily, fontSize, radius, shadow, spacing } from '../theme';

export interface InAppNoticeProps {
  message: RemoteMessage | null;
  onDismiss: () => void;
}

const AUTO_DISMISS_MS = 5000;

/**
 * Transient top banner for FCM messages received while the app is foregrounded
 * (those don't raise a system notification). Tapping deep-links to the post.
 */
export function InAppNotice({ message, onDismiss }: InAppNoticeProps) {
  useEffect(() => {
    if (!message) return;
    const id = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(id);
  }, [message, onDismiss]);

  if (!message) return null;

  const title = message.notification?.title ?? 'New notification';
  const body = message.notification?.body ?? '';
  const postId = typeof message.data?.postId === 'string' ? message.data.postId : undefined;

  return (
    <SafeAreaView style={styles.overlay} edges={['top']} pointerEvents="box-none">
      <Pressable
        style={styles.banner}
        accessibilityRole="button"
        accessibilityLabel={`${title}. ${body}`.trim()}
        onPress={() => {
          navigateToPost(postId);
          onDismiss();
        }}
      >
        <View style={styles.textWrap}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {body ? (
            <Text style={styles.body} numberOfLines={2}>
              {body}
            </Text>
          ) : null}
        </View>
        <Pressable
          onPress={onDismiss}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Dismiss notification"
        >
          <Text style={styles.close}>✕</Text>
        </Pressable>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.md,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.text,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
    ...shadow.lg,
  },
  textWrap: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    color: colors.textInverse,
    fontSize: fontSize.md,
    fontFamily: fontFamily.semibold,
  },
  body: {
    color: colors.textInverse,
    fontSize: fontSize.sm,
    fontFamily: fontFamily.regular,
    opacity: 0.9,
  },
  close: {
    color: colors.textInverse,
    fontSize: fontSize.lg,
  },
});
