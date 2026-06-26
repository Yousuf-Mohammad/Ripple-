import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Post } from '../api/types';
import { colors, fontSize, lineHeight, radius, spacing } from '../theme';
import { formatRelativeTime } from '../utils/relativeTime';
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
        <Text style={styles.author}>@{post.author.username}</Text>
        <Text style={styles.time}>{formatRelativeTime(post.createdAt)}</Text>
      </View>

      <Text style={styles.text}>{post.text}</Text>

      <View style={styles.footer}>
        <LikeButton
          liked={post.likedByMe}
          count={post.likeCount}
          onPress={() => onToggleLike(post)}
        />
        <Pressable
          style={styles.stat}
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
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  author: {
    fontSize: fontSize.md,
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
  footer: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginTop: spacing.xs,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});
