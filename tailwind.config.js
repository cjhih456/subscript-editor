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
      red: colors.red
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
