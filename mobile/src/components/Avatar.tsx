import { StyleSheet, Text, View } from 'react-native';
import { avatarTints, colors, fontFamily } from '../theme';

export interface AvatarProps {
  username: string;
  size?: number;
}

/** Deterministically pick a tint so a username always renders the same color. */
function tintFor(username: string): string {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = (hash << 5) - hash + username.charCodeAt(i);
    hash |= 0;
  }
  return avatarTints[Math.abs(hash) % avatarTints.length];
}

/** Circular initial avatar — gives each author a consistent, distinct identity. */
export function Avatar({ username, size = 40 }: AvatarProps) {
  const initial = (username.trim()[0] ?? '?').toUpperCase();
  const backgroundColor = tintFor(username);
  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2, backgroundColor },
      ]}
      accessibilityElementsHidden
      importantForAccessibility="no"
    >
      <Text style={[styles.initial, { fontSize: size * 0.42 }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    color: colors.textInverse,
    fontFamily: fontFamily.semibold,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});
