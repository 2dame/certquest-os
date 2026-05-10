/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0B0B10',
        bgElevated: '#15151D',
        bgCard: '#1B1B26',
        border: '#2A2A38',
        text: '#F5F1E6',
        textMuted: '#A8A2B2',
        textDim: '#6B6878',
        gold: '#E5C97B',
        oxblood: '#7A1F2C',
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
