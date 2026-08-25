import type { Config } from 'tailwindcss'
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        main: {
          orange: '#FF9800',
          yellow: '#FFD54F',
        },
        sub: {
          green: '#4F7A4B',
          leaf: '#7DBB6D',
          mint: '#DDEFD6',
          cream: '#FFF9EE',
        },
        point: {
          red: '#EF5350',
          blue: '#3B82F6',
          sky: '#74DCFF',
        },
        neutral: {
          950: '#000000',
          900: '#404040',
          800: '#555555',
          700: '#777777',
          500: '#A3A3A3',
          300: '#D4D4D4',
          200: '#E5E5E5',
          100: '#F5F5F5',
          50: '#FAFAFA',
          0: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: [
          'Pretendard Variable',
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'sans-serif',
        ],
      },
      fontSize: {
        'title-1': ['32px', { lineHeight: '1.3', fontWeight: '700' }],
        'title-2': ['24px', { lineHeight: '1.35', fontWeight: '600' }],
        'body-1': ['16px', { lineHeight: '1.5', fontWeight: '600' }],
        'body-2': ['16px', { lineHeight: '1.5', fontWeight: '500' }],
        'body-3': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'caption-1': ['14px', { lineHeight: '1.45', fontWeight: '400' }],
        'caption-2': ['12px', { lineHeight: '1.45', fontWeight: '400' }],
        'caption-3': ['12px', { lineHeight: '1.45', fontWeight: '300' }],
      },
    },
  },
  plugins: [],
} satisfies Config
