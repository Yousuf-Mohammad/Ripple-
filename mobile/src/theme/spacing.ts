/** Spacing scale (px). Use these instead of magic numbers in layouts. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

/** Border radii. */
export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  pill: 999,
} as const;

/** Font sizes. */
export const fontSize = {
  sm: 13,
  md: 15,
  lg: 18,
  xl: 22,
  xxl: 28,
} as const;

/** Line heights for body text, paired roughly with `fontSize`. */
export const lineHeight = {
  sm: 18,
  md: 21,
  lg: 24,
} as const;

/** Interactive control sizing. `size` is a comfortable min tap target (px). */
export const control = {
  size: 44,
  inputMaxHeight: 120,
} as const;

/** Max content width on wide screens (tablet) — keeps lines readable (§6.5). */
export const layout = {
  maxContentWidth: 640,
} as const;
