import { defineNuxtConfig } from 'nuxt'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  typescript: {
    strict: true,
  },
  css: ['@/assets/styles/init.sass'],
  buildModules: [
    [
      '@pinia/nuxt',
      {
        autoImports: ['defineStore', ['defineStore', 'definePiniaStore']],
      },
    ],
  ],
  nitro: {
    minify: true,
    serveStatic: true, // TODO: if need CDN publish
  },
  vite: {
    css: {
      preprocessorOptions: {
        sass: {},
      },
    },
  },
})
