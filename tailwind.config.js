/** @type {import('tailwindcss').Config} */
/* eslint-disable */
const colors = require('tailwindcss/colors')
const plugin = require('tailwindcss/plugin')

function hexToRgbString(hex) {
  if(hex.length === 4) {
    hex = hex.replace('#', '')
    hex = hex.replace(hex[0], hex[0] + hex[0])
    hex = hex.replace(hex[1], hex[1] + hex[1])
    hex = hex.replace(hex[2], hex[2] + hex[2])
  }
  const bigint = parseInt(hex.replace('#', ''), 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `${r} ${g} ${b}`
}

module.exports = {
  mode: 'jit',
  prefix: 'tw-',
  content: [
    'assets/**/*.sass',
    'components/**/*.tsx',
    'layouts/**/*.tsx',
    'pages/**/*.tsx',
    'app.vue',
    'plugins/**/*.{ts}',
    'nuxt.config.{ts}'
  ],
  theme: {
    colors: {
      ...colors,
      transparent: 'transparent',
      current: 'currentColor',
      player: {
        50: 'rgba(112,255,234, <alpha-value>)',
        100: 'rgba(123,221,254, <alpha-value>)',
        200: 'rgba(134,175,253, <alpha-value>)',
        300: 'rgba(142,142,251, <alpha-value>)',
        400: 'rgba(177,148,247, <alpha-value>)',
        500: 'rgba(199,151,242, <alpha-value>)',
        600: 'rgba(208,150,233, <alpha-value>)',
        700: 'rgba(203,142,215, <alpha-value>)',
        800: 'rgba(168,116,173, <alpha-value>)',
        900: 'rgba(107,73,107, <alpha-value>)',
        950: 'rgba(51,35,51, <alpha-value>)'
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
  plugins: [
    plugin(({ addBase, theme }) => {
      addBase({
        ':root': {
          '--g-theme-dark-bg': hexToRgbString(theme('colors.gray.900')),
          '--g-theme-dark-font-color': hexToRgbString(theme('colors.white')),
          '--g-theme-light-bg': hexToRgbString(theme('colors.white')),
          '--g-theme-light-font-color': hexToRgbString(theme('colors.gray.900')),
          '--g-hambug-mini-width': 50,
          '--g-hambug-width': 200,

          '--v-theme-background': hexToRgbString(theme('colors.white')),
          '--v-theme-on-background': hexToRgbString(theme('colors.gray.900')),
          '--v-theme-surface': hexToRgbString(theme('colors.gray.400')),
          '--v-theme-on-surface': hexToRgbString(theme('colors.gray.900')),
          '--v-theme-surface-bright': hexToRgbString(theme('colors.gray.300')),
          '--v-theme-surface-light': hexToRgbString(theme('colors.gray.100')),
          '--v-theme-surface-variant': hexToRgbString(theme('colors.gray.700')),
          '--v-theme-on-surface-variant': hexToRgbString(theme('colors.gray.900')),
          '--v-theme-overlay-multiplier': '5',

          '--v-border-color': hexToRgbString(theme('colors.black')),
          '--v-border-opacity': '0.12',
          '--v-high-emphasis-opacity': '0.90',
          '--v-medium-emphasis-opacity': '0.60',
          '--v-disabled-opacity': '0.38',
          '--v-idle-opacit': '0.04',
          '--v-hover-opacity': '0.04',
          '--v-focus-opacity': '0.08',
          '--v-selected-opacity': '0.06',
          '--v-activated-opacity': '0.08',
          '--v-pressed-opacity': '0.08',
          '--v-dragged-opacity': '0.08',
          '--v-theme-kbd': hexToRgbString(theme('colors.gray.800')),
          '--v-theme-on-kbd': hexToRgbString(theme('colors.white')),
          '--v-theme-code': hexToRgbString(theme('colors.neutral.100')),
          '--v-theme-on-code': hexToRgbString(theme('colors.black'))
        }
      })
    })
  ]
}
