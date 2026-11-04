/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          800: '#112240',
          900: '#0a192f',
          950: '#060d1a',
        },
        risk: {
          low: '#10b981',       // Green
          moderate: '#eab308',  // Yellow
          high: '#f97316',      // Orange
          veryhigh: '#ef4444',  // Red
          extreme: '#881337',   // Dark Red / Deep Crimson
        },
        cooling: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      },
    },
  },
  plugins: [],
}
