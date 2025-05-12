/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bkBlue: {
          50: '#E6EDF5',
          100: '#C0D1E6',
          200: '#96B3D6',
          300: '#6C94C6',
          400: '#4F7AB9',
          500: '#2F61AD',
          600: '#254F8D',
          700: '#1C3D6E',
          800: '#133051',
          900: '#003B73', // Bank of Kigali primary blue
        },
        bkRed: {
          50: '#FCE6E8',
          100: '#F7C1C6',
          200: '#F39AA3',
          300: '#EE737F',
          400: '#EA5764',
          500: '#E63A4A',
          600: '#CF0A2C', // Bank of Kigali primary red
          700: '#A90824',
          800: '#83051B',
          900: '#5E0413',
        },
        bkGold: {
          50: '#FBF8E9',
          100: '#F6ECC8',
          200: '#F0DFA6',
          300: '#EAD385',
          400: '#E4C664',
          500: '#DEBC43',
          600: '#D4AF37', // Bank of Kigali gold accent
          700: '#B28F2D',
          800: '#8F7124',
          900: '#6D531B',
        },
        bkNeutral: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
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
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        'inner-lg': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'even': '0 0 10px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
};