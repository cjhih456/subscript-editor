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
  vite: {
    css: {
      preprocessorOptions: {
        sass: {},
      },
    },
  },
})
