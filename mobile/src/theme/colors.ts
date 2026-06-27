/**
 * Ripple color palette. All color values live here — never hard-code hex in
 * components (§6.5). Semantic, token-driven; tuned for a modern, polished feed.
 */
export const colors = {
  // Brand — a calm "ripple" blue.
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryMuted: '#DBEAFE',
  primarySoft: '#EFF4FF', // tinted surface for selected/active backgrounds

  // Accent — warm engagement pop (used sparingly for emphasis).
  accent: '#F59E0B',

  // Surfaces — layered for depth.
  background: '#FFFFFF', // cards / raised surfaces
  surface: '#F4F6FB', // app canvas behind cards
  surfaceAlt: '#EEF1F8', // inset wells (inputs, code)
  border: '#E6EAF2',
  borderStrong: '#D2D9E6',

  // Text
  text: '#0F172A',
  textMuted: '#64748B',
  textSubtle: '#94A3B8',
  textInverse: '#FFFFFF',

  // Status
  danger: '#DC2626',
  dangerMuted: '#FEE2E2',
  success: '#16A34A',

  // Likes — a warm rose so "liked" reads emotionally, not as an error red.
  like: '#F43F5E',
  likeMuted: '#FFE4E6',

  // Misc
  overlay: 'rgba(15, 23, 42, 0.5)',
  shadow: '#0F172A',
} as const;

/**
 * Tints used for generated avatars. A username hashes into one of these so each
 * person reads as a consistent, distinct color across the app.
 */
export const avatarTints = [
  '#2563EB',
  '#7C3AED',
  '#DB2777',
  '#EA580C',
  '#0891B2',
  '#16A34A',
  '#CA8A04',
  '#E11D48',
] as const;

export type Colors = typeof colors;
