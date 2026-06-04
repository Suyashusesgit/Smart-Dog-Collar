/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tactical: {
          dark: '#020617', // slate-950
          card: '#0f172a', // slate-900
          border: '#334155', // slate-700
          text: '#f8fafc', // slate-50
          normal: '#10b981', // emerald-500
          warning: '#f59e0b', // amber-500
          critical: '#ef4444', // red-500
        }
      },
      fontFamily: {
        tactical: ['Roboto Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-critical': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
