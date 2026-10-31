/** @type {import('tailwindcss').Config} */

const fontFamily = [
  'Inter',
  'ui-sans-serif',
  'system-ui',
  '-apple-system',
  'Segoe UI',
  'Roboto',
  'Helvetica Neue',
  'Arial',
  'sans-serif',
];

module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        '3xl': '1720px',
      },

      colors: {
        /* Deep navy surfaces — one step per elevation. */
        ink: {
          950: '#050914', // editor canvas, deepest wells
          900: '#080E1B', // app background
          850: '#0C1424', // chrome: navbar, toolbars
          800: '#101B2E', // panel / card
          750: '#152239', // nested surface, table head, hover
          700: '#1C2C48', // inputs, raised controls
          600: '#2A3D61', // control borders on hover
          500: '#3B527D', // strong dividers
        },

        /* Hairlines */
        line: {
          DEFAULT: '#22314E',
          soft: '#18243A',
          strong: '#33466A',
        },

        /* Text — every step clears WCAG AA on ink-700 or darker. */
        fg: {
          DEFAULT: '#E9EEF9',
          2: '#C2CCDE',
          3: '#98A6BF',
          4: '#8B99B4',
        },

        /* Brand — indigo actions, with cyan as a sparing secondary accent. */
        mark: {
          DEFAULT: '#4F46E5',
          bright: '#A5B4FC',
          600: '#4338CA',
          700: '#3730A3',
        },
        accent: '#22D3EE',

        /* Semantic — difficulty and verdicts. */
        easy: '#34D399',
        medium: '#FBBF24',
        hard: '#FB7185',

        /* Neutral action surfaces. */
        paper: '#F3F6FF',
        paperdim: '#DDE5F7',
      },

      fontFamily: {
        sans: ['var(--font-sans)', ...fontFamily],
        mono: [
          'var(--font-mono)',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Consolas',
          'monospace',
        ],
      },

      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1.4' }],
      },

      borderRadius: {
        xs: '4px',
        sm: '6px',
        DEFAULT: '8px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
      },

      boxShadow: {
        pop: '0 24px 60px -28px rgba(2, 6, 18, 0.95)',
        lift: '0 12px 32px -24px rgba(2, 6, 18, 0.9)',
        inset: 'inset 0 1px 0 rgba(255, 255, 255, 0.035)',
        glow: '0 0 0 1px rgba(79, 70, 229, 0.28), 0 16px 40px -24px rgba(79, 70, 229, 0.55)',
      },

      maxWidth: {
        shell: '1320px',
        prose: '68ch',
      },

      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },

      animation: {
        'fade-up': 'fade-up 0.32s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [],
};
