/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fintech: {
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155',
          600: '#475569',
          500: '#64748B',
          100: '#F1F5F9',
          50: '#F8FAFC',
        },
        primary: {
          500: '#3B82F6',
          400: '#60A5FA',
        },
        success: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B'
      }
    },
  },
  plugins: [],
}
