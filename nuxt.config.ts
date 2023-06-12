
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
  modules: [
    [
      '@pinia/nuxt',
      {
        autoImports: ['defineStore', ['defineStore', 'definePiniaStore']]
      }
    ],
    '@nuxt/devtools'
  ],
  nitro: {
    minify: true,
    serveStatic: true // TODO: if need CDN publish
  },
  vite: {
    css: {
      preprocessorOptions: {
        sass: {}
      }
    }
  }
})
