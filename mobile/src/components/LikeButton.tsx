import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily, fontSize, radius, spacing } from '../theme';

export interface LikeButtonProps {
  liked: boolean;
  count: number;
  onPress: () => void;
}

/** Presentational like control — heart + count. Logic lives in useToggleLike. */
export function LikeButton({ liked, count, onPress }: LikeButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  // Pop the heart whenever it flips to liked — a small, meaningful delight.
  useEffect(() => {
    if (!liked) return;
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.3, useNativeDriver: true, speed: 50, bounciness: 16 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 12 }),
    ]).start();
  }, [liked, scale]);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        liked && styles.buttonLiked,
        pressed && styles.buttonPressed,
      ]}
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityState={{ selected: liked }}
      accessibilityLabel={liked ? 'Unlike post' : 'Like post'}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <Ionicons
          name={liked ? 'heart' : 'heart-outline'}
          size={20}
          color={liked ? colors.like : colors.textMuted}
        />
      </Animated.View>
      <Text style={[styles.count, liked && styles.countLiked]}>{count}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
  },
  buttonLiked: {
    backgroundColor: colors.likeMuted,
  },
  buttonPressed: {
    opacity: 0.6,
  },
  count: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.medium,
    color: colors.textMuted,
  },
  countLiked: {
    color: colors.like,
  },
});
