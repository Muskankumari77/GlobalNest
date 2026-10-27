import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { 950: '#071a33', 900: '#0b2545', 800: '#0f2f57', 700: '#173d6b' },
        teal: { 50: '#e8faf6', 100: '#c9f2ea', 400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e' },
        sky: { 50: '#f1f7fd', 100: '#e3effa' },
        lav: { 50: '#f4f1ff', 100: '#e9e3ff', 600: '#6d4fd6' },
        ink: '#0b2545',
        mist: '#f4f8fb',
      },
      boxShadow: { card: '0 1px 2px rgba(11,37,69,.04), 0 4px 16px rgba(11,37,69,.05)' },
      fontFamily: { sans: ['var(--font-inter)', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
export default config;
