// Dark-first design tokens. Extracted into a single source so web and mobile
// stay visually consistent.
export const theme = {
  colors: {
    bg: '#0B0B10',
    bgElevated: '#15151D',
    bgCard: '#1B1B26',
    border: '#2A2A38',
    borderStrong: '#3A3A4D',
    text: '#F5F1E6',
    textMuted: '#A8A2B2',
    textDim: '#6B6878',
    gold: '#E5C97B',
    goldDim: '#A88F4A',
    oxblood: '#7A1F2C',
    success: '#5BA887',
    warning: '#E0A458',
    danger: '#C45A5A',
  },
  radii: {
    none: 0,
    sm: 2,
    md: 4,
    lg: 8,
  },
  space: (n: number) => n * 4,
  font: {
    serif: 'Cormorant Garamond',
    sans: 'Manrope',
  },
} as const;
