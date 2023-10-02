// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  app: {
    head: {
      charset: 'utf-8'
    }
  },
  typescript: {
    strict: true
  },
  ssr: false,
  css: ['@/assets/styles/init.sass'],
  runtimeConfig: {
    public: {
      BACKEND_API: ''
    }
  },
  modules: [
    [
      '@pinia/nuxt',
      {
        autoImports: ['defineStore', ['defineStore', 'definePiniaStore']]
      }
    ],
    '@nuxtjs/storybook',
    '@nuxt/devtools'
  ],
  storybook: {
    devtools: true,
    version: 'v7'
  },
  nitro: {
    minify: true,
    serveStatic: true // TODO: if need CDN publish
  },
  vite: {
    css: {
      preprocessorOptions: {
        module: () => true
      }
    }
  }
})
