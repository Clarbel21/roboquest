/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Light-blue theme: abyss is the page wash, the "navy" scale is now
        // the surface scale (cards, chips, tracks, borders) in soft blue.
        abyss: '#E9F3FC',
        navy: {
          950: '#DCEBFA',
          900: '#FFFFFF',
          800: '#EAF2FB',
          700: '#D3E4F6',
          600: '#B9D2EC',
        },
        // Slate is overridden so every text-slate-* class flips dark for the
        // light background without touching component markup.
        slate: {
          100: '#1B2C44',
          200: '#273A54',
          300: '#3E5470',
          400: '#5F7893',
          500: '#74889E',
          600: '#93A7BC',
        },
        volt: {
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
        },
        teal2: { 400: '#2DD4BF', 500: '#14B8A6' },
        vio: { 400: '#A78BFA', 500: '#8B5CF6' },
      },
      fontFamily: {
        sans: ['"Segoe UI"', 'system-ui', '-apple-system', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        mono: ['"Cascadia Code"', 'Consolas', '"SF Mono"', 'Menlo', 'monospace'],
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'blink': 'blink 5s infinite',
        'pulse-soft': 'pulseSoft 2.4s ease-in-out infinite',
        'slide-up': 'slideUp 0.35s ease-out',
        'pop': 'pop 0.25s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        blink: {
          '0%, 92%, 100%': { transform: 'scaleY(1)' },
          '95%': { transform: 'scaleY(0.1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pop: {
          from: { opacity: '0', transform: 'scale(0.94)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
      boxShadow: {
        glow: '0 0 22px rgba(14, 165, 233, 0.30)',
        card: '0 4px 20px rgba(30, 90, 160, 0.10)',
      },
    },
  },
  plugins: [],
};
