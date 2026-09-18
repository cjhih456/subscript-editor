// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import { globalIgnores } from 'eslint/config'

export default withNuxt(
  // Your custom configs here
  [
    globalIgnores([
      './design-system/subscript-editor/scripts/**'
    ]),
    {
      rules: {
        'vue/require-default-prop': 'off'
      },
    }
  ]
)
