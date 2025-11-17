import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Spartan-inspired color palette
        spartan: {
          bronze: {
            50: '#fdf8f3',
            100: '#faf0e6',
            200: '#f2d9bf',
            300: '#e9c298',
            400: '#d89551',
            500: '#c77b30',
            600: '#a96328',
            700: '#8b4f23',
            800: '#714120',
            900: '#5d371d',
          },
          crimson: {
            50: '#fef2f2',
            100: '#fee2e2',
            200: '#fecaca',
            300: '#fca5a5',
            400: '#f87171',
            500: '#dc2626',
            600: '#b91c1c',
            700: '#991b1b',
            800: '#7f1d1d',
            900: '#651a1a',
          },
          gold: {
            50: '#fffcf0',
            100: '#fff8db',
            200: '#ffeead',
            300: '#ffe280',
            400: '#ffd633',
            500: '#f5c400',
            600: '#c79d00',
            700: '#9a7800',
            800: '#6b5300',
            900: '#4a3800',
          },
          stone: {
            50: '#fafaf9',
            100: '#f5f5f4',
            200: '#e7e5e4',
            300: '#d6d3d1',
            400: '#a8a29e',
            500: '#78716c',
            600: '#57534e',
            700: '#44403c',
            800: '#292524',
            900: '#1c1917',
          },
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'spartan-hero': 'linear-gradient(135deg, #1c1917 0%, #44403c 50%, #78716c 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in',
        'slide-up': 'slideUp 0.8s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
export default config
