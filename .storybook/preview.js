import * as jest from 'jest-mock'
import { withSource } from './withSource'
window.jest = jest

export const decorators = [
  withSource
]

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}