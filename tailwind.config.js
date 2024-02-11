/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')
module.exports = {
  mode: 'jit',
  prefix: 'tw-',
  content: [
    'components/**/*.tsx',
    'layouts/**/*.tsx',
    'pages/**/*.tsx',
    'app.vue',
    'plugins/**/*.{ts}',
    'nuxt.config.{ts}'
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: colors.black,
      white: colors.white,
      gray: colors.gray,
      emerald: colors.emerald,
      indigo: colors.indigo,
      yellow: colors.yellow,
      red: colors.red,
      player: {
        50: 'rgba(var(--tw-colors-player-50), <alpha-value>)',
        100: 'rgba(var(--tw-colors-player-100), <alpha-value>)',
        200: 'rgba(var(--tw-colors-player-200), <alpha-value>)',
        300: 'rgba(var(--tw-colors-player-300), <alpha-value>)',
        400: 'rgba(var(--tw-colors-player-400), <alpha-value>)',
        500: 'rgba(var(--tw-colors-player-500), <alpha-value>)',
        600: 'rgba(var(--tw-colors-player-600), <alpha-value>)',
        700: 'rgba(var(--tw-colors-player-700), <alpha-value>)',
        800: 'rgba(var(--tw-colors-player-800), <alpha-value>)',
        900: 'rgba(var(--tw-colors-player-900), <alpha-value>)',
        950: 'rgba(var(--tw-colors-player-950), <alpha-value>)'
      }
    },
    extend: {
      screens: {
        '3xl': { max: '1535px' },
        // => @media (max-width: 1535px) { ... }

        '2xl': { max: '1430px' },
        // => @media (max-width: 1535px) { ... }

        xl: { max: '1290px' },
        // => @media (max-width: 1279px) { ... }

        lg: { max: '1023px' },
        // => @media (max-width: 1023px) { ... }

        md: { max: '767px' },
        // => @media (max-width: 767px) { ... }

        sm: { max: '539px' }
        // => @media (max-width: 639px) { ... }
      }
    }
  },
  plugins: []
}
