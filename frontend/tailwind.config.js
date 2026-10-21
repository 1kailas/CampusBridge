/** @type {import('tailwindcss').Config} */

const fontFamily = [
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
        /* Surfaces — cool graphite, one step per elevation */
        ink: {
          950: '#080A0F', // editor canvas, deepest wells
          900: '#0C0F15', // app background
          850: '#10141B', // chrome: navbar, toolbars
          800: '#141922', // panel / card
          750: '#191F2A', // nested surface, table head, hover
          700: '#1F2632', // inputs, raised controls
          600: '#2A3241', // control borders on hover
          500: '#39424F', // strong dividers
        },

        /* Hairlines */
        line: {
          DEFAULT: '#232A38',
          soft: '#1A202B',
          strong: '#2E3749',
        },

        /* Text */
        fg: {
          DEFAULT: '#E9ECF3',
          2: '#A7B0C2',
          3: '#727C90',
          4: '#4E5768',
        },

        /* Brand — highlighter amber. Logo, streak, rank, reward, focus. */
        mark: {
          DEFAULT: '#FFC145',
          600: '#E8A92E',
          700: '#C68C1E',
        },

        /* Semantic — difficulty is the only saturated set */
        easy: '#3FC38A',
        medium: '#F0863C',
        hard: '#F0596B',

        /* Neutral action — the one primary button */
        paper: '#EDF0F6',
        paperdim: '#D3D9E4',
      },

      fontFamily: {
        sans: ['var(--font-plex-sans)', ...fontFamily],
        mono: ['var(--font-plex-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },

      fontSize: {
        // 2xs used only for micro-labels inside dense chrome
        '2xs': ['0.6875rem', { lineHeight: '1.35' }],
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
        pop: '0 24px 48px -16px rgba(0,0,0,0.72), 0 0 0 1px rgba(255,255,255,0.03)',
        lift: '0 8px 24px -12px rgba(0,0,0,0.6)',
        inset: 'inset 0 1px 0 rgba(255,255,255,0.025)',
      },

      maxWidth: {
        shell: '1440px',
      },
    },
  },
  plugins: [],
};
