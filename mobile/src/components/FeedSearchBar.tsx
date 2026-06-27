import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFeedContext } from '../feed/FeedContext';
import { colors, fontFamily, fontSize, radius, spacing } from '../theme';

/**
 * Header search field for filtering the feed by author username. It sources its
 * value straight from `useFeedContext()` (rather than props) on purpose: the
 * FeedScreen only re-runs `setOptions` when search mode toggles, so this element
 * is not recreated on each keystroke and the TextInput keeps focus.
 */
export function FeedSearchBar() {
  const { filterText, setFilterText } = useFeedContext();
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={18} color={colors.textMuted} />
      <TextInput
        style={styles.input}
        value={filterText}
        onChangeText={setFilterText}
        placeholder="Filter by username"
        placeholderTextColor={colors.textSubtle}
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus
        returnKeyType="search"
      />
      {filterText.length > 0 ? (
        <Pressable
          onPress={() => setFilterText('')}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Clear filter"
        >
          <Ionicons name="close-circle" size={18} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 220,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: fontSize.md,
    fontFamily: fontFamily.regular,
    color: colors.text,
    paddingVertical: spacing.xs,
  },
});
