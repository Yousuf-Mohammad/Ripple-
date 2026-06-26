import { Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, spacing } from '../theme';

export interface LikeButtonProps {
  liked: boolean;
  count: number;
  onPress: () => void;
}

/** Presentational like control — heart + count. Logic lives in useToggleLike. */
export function LikeButton({ liked, count, onPress }: LikeButtonProps) {
  return (
    <Pressable
      style={styles.button}
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={liked ? 'Unlike post' : 'Like post'}
    >
      <Ionicons
        name={liked ? 'heart' : 'heart-outline'}
        size={20}
        color={liked ? colors.danger : colors.textMuted}
      />
      <Text style={[styles.count, liked && styles.countLiked]}>{count}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  count: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  countLiked: {
    color: colors.danger,
  },
});
