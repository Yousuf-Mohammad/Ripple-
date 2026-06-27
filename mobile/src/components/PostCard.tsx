import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Post } from '../api/types';
import { colors, fontFamily, fontSize, lineHeight, radius, shadow, spacing } from '../theme';
import { formatRelativeTime } from '../utils/relativeTime';
import { Avatar } from './Avatar';
import { LikeButton } from './LikeButton';

export interface PostCardProps {
  post: Post;
  onToggleLike: (post: Post) => void;
  onPressComments: (post: Post) => void;
}

/** A single feed post with an interactive like button and a comments shortcut. */
function PostCardComponent({ post, onToggleLike, onPressComments }: PostCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Avatar username={post.author.username} size={40} />
        <View style={styles.headerText}>
          <Text style={styles.author}>@{post.author.username}</Text>
          <Text style={styles.time}>{formatRelativeTime(post.createdAt)}</Text>
        </View>
      </View>

      <Text style={styles.text}>{post.text}</Text>

      <View style={styles.footer}>
        <LikeButton
          liked={post.likedByMe}
          count={post.likeCount}
          onPress={() => onToggleLike(post)}
        />
        <Pressable
          style={({ pressed }) => [styles.stat, pressed && styles.statPressed]}
          onPress={() => onPressComments(post)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`View comments (${post.commentCount})`}
        >
          <Ionicons name="chatbubble-outline" size={18} color={colors.textMuted} />
          <Text style={styles.statText}>{post.commentCount}</Text>
        </Pressable>
      </View>
    </View>
  );
}

export const PostCard = memo(PostCardComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadow.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
    gap: 1,
  },
  author: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.semibold,
    color: colors.text,
  },
  time: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.regular,
    color: colors.textSubtle,
  },
  text: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.regular,
    color: colors.text,
    lineHeight: lineHeight.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
  },
  statPressed: {
    backgroundColor: colors.surfaceAlt,
  },
  statText: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.medium,
    color: colors.textMuted,
  },
});
