import { Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements';
import { colors, fontFamily, fontSize, radius, shadow, spacing } from '../theme';

export interface AnchorRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface UserMenuProps {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
  /** Screen rect of the trigger (from measureInWindow) to anchor the card under. */
  anchor: AnchorRect | null;
}

const GAP = 8;

/**
 * Small account dropdown anchored directly under the top-right header trigger.
 * Built from a transparent Modal + a tap-to-dismiss backdrop so it needs no
 * extra library. Position comes from the trigger's measured rect (window coords,
 * which match the statusBarTranslucent Modal's coordinate space).
 */
export function UserMenu({ visible, onClose, onLogout, anchor }: UserMenuProps) {
  const headerHeight = useHeaderHeight();
  const { width: windowWidth } = useWindowDimensions();

  const top = anchor ? anchor.y + anchor.height + GAP : headerHeight + GAP;
  const right = anchor
    ? Math.max(spacing.lg, windowWidth - (anchor.x + anchor.width))
    : spacing.lg;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Dismiss menu">
        <View style={[styles.card, { top, right }]}>
          <Pressable
            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
            onPress={() => {
              onClose();
              onLogout();
            }}
            accessibilityRole="button"
            accessibilityLabel="Log out"
          >
            <Ionicons name="log-out-outline" size={20} color={colors.danger} />
            <Text style={styles.itemText}>Log out</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
  },
  card: {
    position: 'absolute',
    minWidth: 160,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.xs,
    ...shadow.lg,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
  },
  itemPressed: {
    backgroundColor: colors.dangerMuted,
  },
  itemText: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.semibold,
    color: colors.danger,
  },
});
