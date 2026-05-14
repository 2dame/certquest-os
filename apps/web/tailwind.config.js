/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--color-bg) / <alpha-value>)',
        bgElevated: 'rgb(var(--color-bg-elevated) / <alpha-value>)',
        bgCard: 'rgb(var(--color-bg-card) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        text: 'rgb(var(--color-text) / <alpha-value>)',
        textMuted: 'rgb(var(--color-text-muted) / <alpha-value>)',
        textDim: 'rgb(var(--color-text-dim) / <alpha-value>)',
        gold: 'rgb(var(--color-gold) / <alpha-value>)',
        oxblood: 'rgb(var(--color-oxblood) / <alpha-value>)',
        danger: 'rgb(var(--color-danger) / <alpha-value>)',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      },
      borderRadius: { none: '0px' },
    },
  },
  plugins: [],
};
