/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        /* Claude-inspired: Warm, Editorial Colors */
        terracotta: {
          DEFAULT: '#c96442',
          light: '#d97757',
          dark: '#b8563a',
        },
        parchment: {
          DEFAULT: '#f5f4ed',
          light: '#faf9f5',
          dark: '#e8e6dc',
        },
        bg: {
          main: '#f5f4ed',        /* Parchment */
          surface: '#faf9f5',     /* Ivory */
          card: '#faf9f5',        /* Ivory */
          hover: '#fdfbf8',       /* Slightly darker ivory */
          border: '#f0eee6',      /* Border Cream */
          dark: '#141413',        /* Near Black (dark mode) */
          darkcard: '#30302e',    /* Dark Surface (dark mode) */
        },
        text: {
          primary: '#141413',     /* Anthropic Near Black */
          secondary: '#5e5d59',   /* Olive Gray */
          muted: '#87867f',       /* Stone Gray */
        },
        /* Legacy status colors (compatible with existing) */
        danger: '#b53333',        /* Warm red error */
        success: '#10b981',       /* Green success */
        warning: '#f59e0b',       /* Amber warning */
      },
      fontFamily: {
        headline: ['Georgia', 'serif'],  /* Claude: Serif for headings */
        mono: ['"IBM Plex Mono"', 'Consolas', 'monospace'],
        body: ['system-ui', 'sans-serif'], /* Claude: Sans for body/UI */
      },
      fontSize: {
        '2xs': '0.65rem',
      },
    },
  },
  plugins: [],
}
