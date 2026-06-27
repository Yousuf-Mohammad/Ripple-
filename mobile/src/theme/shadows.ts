import { Platform } from 'react-native';
import { colors } from './colors';

/**
 * Cross-platform elevation scale. iOS reads the `shadow*` props; Android reads
 * `elevation`. Use a consistent step (sm/md/lg) rather than ad-hoc shadow values
 * so cards, buttons, and sheets share one depth language.
 */
type Elevation = {
  shadowColor: string;
  shadowOpacity: number;
  shadowRadius: number;
  shadowOffset: { width: number; height: number };
  elevation: number;
};

const make = (
  opacity: number,
  radius: number,
  offsetY: number,
  elevation: number,
): Elevation => ({
  shadowColor: colors.shadow,
  shadowOpacity: opacity,
  shadowRadius: radius,
  shadowOffset: { width: 0, height: offsetY },
  elevation,
});

export const shadow = {
  // Resting card lift — subtle on iOS, low elevation on Android.
  sm: Platform.select({
    ios: make(0.06, 8, 2, 2),
    default: make(0.1, 6, 2, 2),
  }) as Elevation,
  // Primary buttons / raised controls.
  md: Platform.select({
    ios: make(0.1, 14, 6, 4),
    default: make(0.16, 10, 4, 4),
  }) as Elevation,
  // Sheets / floating surfaces.
  lg: Platform.select({
    ios: make(0.14, 24, 12, 8),
    default: make(0.2, 16, 8, 8),
  }) as Elevation,
} as const;
