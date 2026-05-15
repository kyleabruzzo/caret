/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/**/*.{ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--caret-bg)',
        panel: 'var(--caret-panel)',
        elevated: '#16161a',
        border: '#1f1f23',
        muted: '#6b6b73',
        fg: '#e6e6e8',
        accent: 'var(--caret-accent)'
      },
      fontFamily: {
        sans: ['var(--caret-font-sans)'],
        mono: ['var(--caret-font-mono)']
      }
    }
  },
  plugins: []
};
