/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#070a12',
        foreground: '#f8fafc',
        card: {
          DEFAULT: '#0f172a80',
          hover: '#1e293b90'
        },
        primary: {
          DEFAULT: '#3b82f6',
          foreground: '#ffffff',
          glow: '#3b82f640'
        },
        accent: {
          cyan: '#06b6d4',
          emerald: '#10b981',
          purple: '#8b5cf6',
          amber: '#f59e0b',
          rose: '#f43f5e'
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.35)',
        'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.35)',
      }
    },
  },
  plugins: [],
}
