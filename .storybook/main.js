module.exports = {
  "stories": [
    "../stories/**/*.stories.mdx",
    "../stories/**/*.stories.@(js|jsx|ts|tsx)",
    "../layouts/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions"
  ],
  "core": {
    builder: "@storybook/builder-vite"
  },
  "framework": "@storybook/vue3",
  async viteFinal(config) {
    return {
      ...config,
      define: {
        ...config.define,
        global: "window"
      }
    }
  },
  "features": {
    "storyStoreV7": true
  },
  staticDirs: ['../public']
}