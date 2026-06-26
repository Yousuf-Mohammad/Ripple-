/**
 * Ripple color palette. All color values live here — never hard-code hex in
 * components (§6.5).
 */
export const colors = {
  // Brand — a calm "ripple" blue.
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryMuted: '#DBEAFE',

  // Surfaces
  background: '#FFFFFF',
  surface: '#F8FAFC',
  border: '#E2E8F0',

  // Text
  text: '#0F172A',
  textMuted: '#64748B',
  textInverse: '#FFFFFF',

  // Status
  danger: '#DC2626',
  dangerMuted: '#FEE2E2',
  success: '#16A34A',

  // Misc
  overlay: 'rgba(15, 23, 42, 0.4)',
} as const;

export type Colors = typeof colors;
