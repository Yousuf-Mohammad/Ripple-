import { StyleSheet, Text, View } from 'react-native';
import type { Comment } from '../api/types';
import { colors, fontFamily, fontSize, lineHeight, radius, spacing } from '../theme';
import { formatRelativeTime } from '../utils/relativeTime';
import { Avatar } from './Avatar';

/** A single comment row — Facebook-style: avatar + a rounded name/text bubble. */
export function CommentItem({ comment }: { comment: Comment }) {
  return (
    <View style={styles.row}>
      <Avatar username={comment.author.username} size={36} />
      <View style={styles.bubbleColumn}>
        <View style={styles.bubble}>
          <Text style={styles.author}>@{comment.author.username}</Text>
          <Text style={styles.text}>{comment.text}</Text>
        </View>
        <Text style={styles.time}>{formatRelativeTime(comment.createdAt)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  bubbleColumn: {
    flex: 1,
    alignItems: 'flex-start',
  },
  // The grey rounded "speech bubble" that wraps name + text, sized to content.
  bubble: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 2,
  },
  author: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.semibold,
    color: colors.text,
  },
  text: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.regular,
    color: colors.text,
    lineHeight: lineHeight.md,
  },
  time: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.regular,
    color: colors.textSubtle,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
  },
});
