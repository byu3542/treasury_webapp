/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#d4a843',
          light: '#e8c060',
          dark: '#b8912e',
        },
        teal: {
          DEFAULT: '#2dd4bf',
          light: '#5eead4',
          dark: '#14b8a6',
        },
        bg: {
          main: '#080f18',
          surface: '#0e1c2e',
          card: '#112236',
          hover: '#162c42',
          border: '#1e3a52',
        },
        text: {
          primary: '#e8f4f8',
          secondary: '#8baec4',
          muted: '#4a6b82',
        },
        danger: '#f87171',
        success: '#4ade80',
        warning: '#fbbf24',
      },
      fontFamily: {
        headline: ['Fraunces', 'Georgia', 'serif'],
        mono: ['"IBM Plex Mono"', 'Consolas', 'monospace'],
        body: ['Lato', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': '0.65rem',
      },
    },
  },
  plugins: [],
}
