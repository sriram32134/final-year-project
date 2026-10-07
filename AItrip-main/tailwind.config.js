/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        space: {
          950: '#000000',
          900: '#0a0a0a',
          850: '#111111',
          800: '#171717',
          700: '#222222',
          600: '#2a2a2a',
        },
        cyan: {
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          glow: '#00f0ff',
        },
        accent: {
          gold: '#f59e0b',
          amber: '#fbbf24',
          rose: '#f43f5e',
          emerald: '#10b981',
          violet: '#8b5cf6',
          blue: '#3b82f6',
        }
      },
      fontFamily: {
        sans: ['Montserrat', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Oswald', 'Bebas Neue', 'Montserrat', 'sans-serif'],
        condensed: ['Bebas Neue', 'Oswald', 'Impact', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.4)',
        'glow-blue': '0 0 30px -5px rgba(59, 130, 246, 0.35)',
        'glow-sm': '0 0 15px -3px rgba(6, 182, 212, 0.25)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.9' },
        }
      }
    },
  },
  plugins: [],
}
