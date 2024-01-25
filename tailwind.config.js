/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  prefix: 'tw-',
  content: [
    'components/**/*.{tsx}',
    'layouts/**/*.tsx',
    'pages/**/*.tsx',
    'app.vue',
    'plugins/**/*.{ts}',
    'nuxt.config.{ts}'
  ],
  theme: {
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
