/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        medlens: {
          primary: '#218DAE',
          'primary-dark': '#186d88',
          'primary-light': '#e8f4f8',
          'primary-hover': '#1b7591',
          ai: '#2BBBD7',
          'ai-light': '#eaf9fc',
          'ai-dark': '#1fa2bb',
          accent: '#FCE59A',
          'accent-light': '#fef9e8',
          strong: '#FFD758',
          'strong-dark': '#e6bd35',
          neutral: {
            50: '#F8FAFB',
            100: '#F1F4F6',
            200: '#E2E7EB',
            300: '#CBD4D9',
            400: '#94A3B8',
            500: '#64748B',
            600: '#475569',
            700: '#334155',
            800: '#1E293B',
            900: '#0F172A',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      animation: {
        'blur-in': 'blurIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'blur-out': 'blurOut 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'pulse-subtle': 'pulseSubtle 2s infinite',
      },
      keyframes: {
        blurIn: {
          '0%': { filter: 'blur(20px)', opacity: '0', transform: 'scale(0.98)' },
          '100%': { filter: 'blur(0)', opacity: '1', transform: 'scale(1)' },
        },
        blurOut: {
          '0%': { filter: 'blur(0)', opacity: '1', transform: 'scale(1)' },
          '100%': { filter: 'blur(20px)', opacity: '0', transform: 'scale(1.02)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        }
      }
    },
  },
  plugins: [],
}
