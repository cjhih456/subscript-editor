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
  // nitro: { // 활성화시 build되어 hot reload가 정상적으로 작동하지 않는다. dev환경에서는 undefined로 지정되게 하자.
  //   minify: true,
  //   serveStatic: false // TODO: if need CDN publish
  // },
  devtools: {
    enabled: true
  }
  // vite: {
  //   css: {
  //     preprocessorOptions: {
  //       module: () => true
  //     }
  //   }
  // }
})
