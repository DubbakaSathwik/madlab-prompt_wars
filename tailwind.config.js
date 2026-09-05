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
          primary: '#70FFD2',
          'primary-dark': '#4ee4b5',
          'primary-light': '#ecfdf5',
          'primary-hover': '#5bebc0',
          secondary: '#FFFC8C',
          'secondary-light': '#fffde8',
          'secondary-dark': '#f5f278',
          accent: '#FFCC4D',
          'accent-light': '#fff9e6',
          'accent-dark': '#f0b830',
          warning: '#FF9137',
          'warning-light': '#fff4eb',
          'warning-dark': '#ea791e',
          ai: '#2BBBD7',
          'ai-light': '#eaf9fc',
          'ai-dark': '#1fa2bb',
          strong: '#FFCC4D',
          'strong-dark': '#f0b830',
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
