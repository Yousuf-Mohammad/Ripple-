import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily, fontSize, radius, shadow, spacing } from '../theme';
import { Avatar } from './Avatar';

export interface MakeRippleTriggerProps {
  username: string;
  onPress: () => void;
}

/**
 * Facebook-style "What's on your mind?" composer trigger that sits at the top of
 * the feed. It's not an input itself — tapping anywhere opens the Create Post
 * screen.
 */
export function MakeRippleTrigger({ username, onPress }: MakeRippleTriggerProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Make a Ripple, create a post"
    >
      <Avatar username={username} size={40} />
      <View style={styles.pill}>
        <Text style={styles.placeholder}>Make a Ripple…</Text>
      </View>
      <Ionicons name="create-outline" size={22} color={colors.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...shadow.sm,
  },
  cardPressed: {
    backgroundColor: colors.surfaceAlt,
  },
  pill: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  placeholder: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.regular,
    color: colors.textSubtle,
  },
});
