/**
 * Shared design tokens for CertQuest OS.
 * Mobile theme.ts and web tailwind.config.ts both consume these values.
 *
 * Visual language: dark-first, premium, no rounded corners.
 * Palette: gold / black / oxblood / cream.
 * Typography: Cormorant Garamond (display) + Manrope (body).
 */

export const tokens = {
  colors: {
    bg: '#0B0B10',
    bgElevated: '#15151D',
    bgCard: '#1B1B26',
    border: '#2A2A38',
    gold: '#E5C97B',
    goldDim: '#B89A52',
    oxblood: '#7A1F2C',
    oxbloodDim: '#5A1620',
    cream: '#F5F1E6',
    text: '#F5F1E6',
    textMuted: '#A8A39A',
    textDim: '#6B6760',
    success: '#7BA05B',
    warning: '#D4A24C',
    danger: '#B5483F',
  },
  radii: {
    none: 0,
    sm: 0,
    md: 0,
    lg: 0,
  },
  spacing: {
    unit: 4,
  },
  fonts: {
    display: 'Cormorant Garamond',
    body: 'Manrope',
  },
  fontSizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 22,
    '2xl': 28,
    '3xl': 36,
    '4xl': 48,
  },
} as const;

export type Tokens = typeof tokens;
