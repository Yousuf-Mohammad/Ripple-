/**
 * Font families. We ship Poppins (a friendly geometric sans) for a modern,
 * branded feel. The weight lives in the family name on native — RN doesn't
 * synthesize weights for custom fonts — so pair these with the matching
 * `fontWeight` only as a fallback before fonts finish loading.
 *
 * The keys map to the @expo-google-fonts/poppins exports loaded in App.tsx.
 */
export const fontFamily = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
} as const;

export type FontFamily = typeof fontFamily;
