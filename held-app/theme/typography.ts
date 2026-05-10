// Font family names match the @expo-google-fonts/* package exports loaded in app/_layout.tsx.

export const fonts = {
  serif: {
    light: 'Fraunces_300Light',
    lightItalic: 'Fraunces_300Light_Italic',
    regular: 'Fraunces_400Regular',
    regularItalic: 'Fraunces_400Regular_Italic',
    medium: 'Fraunces_500Medium',
    mediumItalic: 'Fraunces_500Medium_Italic',
  },
  sans: {
    regular: 'Manrope_400Regular',
    medium: 'Manrope_500Medium',
    semibold: 'Manrope_600SemiBold',
  },
} as const;
