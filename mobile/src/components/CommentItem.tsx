import { StyleSheet, Text, View } from 'react-native';
import type { Comment } from '../api/types';
import { colors, fontSize, lineHeight, radius, spacing } from '../theme';
import { formatRelativeTime } from '../utils/relativeTime';

/** A single comment row. */
export function CommentItem({ comment }: { comment: Comment }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.author}>@{comment.author.username}</Text>
        <Text style={styles.time}>{formatRelativeTime(comment.createdAt)}</Text>
      </View>
      <Text style={styles.text}>{comment.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  author: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.primary,
  },
  time: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  text: {
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: lineHeight.md,
  },
});
