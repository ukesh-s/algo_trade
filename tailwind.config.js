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
        dark: {
          950: '#06090e',
          900: '#0b0f17',
          850: '#101724',
          800: '#141d2f',
          700: '#1e293b',
          600: '#334155',
        },
        brand: {
          primary: '#38bdf8', // sky-400
          accent: '#818cf8',  // indigo-400
          emerald: '#10b981', // emerald-500
          bull: '#10b981',    // green
          bear: '#f43f5e',    // rose
          gold: '#f59e0b',    // amber
          purple: '#a855f7',  // purple-500
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-bull': '0 0 20px -3px rgba(16, 185, 129, 0.35)',
        'glow-bear': '0 0 20px -3px rgba(244, 63, 94, 0.35)',
        'glow-sky': '0 0 20px -3px rgba(56, 189, 248, 0.35)',
        'glow-purple': '0 0 20px -3px rgba(168, 85, 247, 0.35)',
        'card-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
