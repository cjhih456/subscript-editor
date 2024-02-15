// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  app: {
    head: {
      charset: 'utf-8'
    }
  },
  typescript: {
    shim: true,
    strict: true
  },
  postcss: {
    plugins: {
      autoprefixer: {},
      tailwindcss: {}
    }
  },
  build: {
    transpile: ['@ffmpeg/ffmpeg', '@ffmpeg/util']
  },
  vite: {
    optimizeDeps: {
      exclude: ['vuetify', '@ffmpeg/ffmpeg', '@ffmpeg/util']
    },
    server: {
      headers: {
        permissionsPolicy: 'fullscreen=self',
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp'
      }
    }
  },
  css: [
    '@mdi/font/css/materialdesignicons.min.css',
    '@/assets/styles/css/main.css',
    '@/assets/styles/init.sass',
    'video.js/dist/video-js.css'
  ],
  runtimeConfig: {
    public: {
      BACKEND_API: 'http://localhost:3000'
    }
  },
  modules: [[
    '@pinia/nuxt',
    {
      autoImports: ['defineStore', ['defineStore', 'definePiniaStore']]
    }
  ], '@nuxtjs/storybook', '@nuxt/devtools', 'nuxt-security', 'dayjs-nuxt', 'vuetify-nuxt-module'],
  vuetify: {
    moduleOptions: {
      importComposables: true,
      styles: {
        configFile: 'assets/styles/variable/vuetify-settings-variable.scss'
      }
    },
    vuetifyOptions: {
      theme: false,
      icons: {
        defaultSet: 'mdi-svg'
      }
    }
  },
  features: {
    inlineStyles: false
  },
  dayjs: {
    plugins: ['utc', 'customParseFormat', 'duration']
  },
  security: {
    headers: {
      crossOriginResourcePolicy: 'cross-origin',
      crossOriginOpenerPolicy: 'same-origin',
      crossOriginEmbedderPolicy: import.meta.env.DEV ? 'unsafe-none' : 'require-corp',
      permissionsPolicy: 'fullscreen=self'
    },
    corsHandler: {
      origin: '*',
      methods: '*',
      allowHeaders: '*'
    }
  },
  storybook: {
    devtools: true,
    version: 'v7'
  },
  nitro: {
    routeRules: {
      '/_nuxt/**': {
        headers: {
          crossOriginResourcePolicy: 'cross-origin',
          crossOriginOpenerPolicy: 'same-origin'
        }
      },
      '/whisper/**': {
        proxy: {
          to: 'http://localhost:9000/**',
          streamRequest: true,
          sendStream: true,
          fetchOptions: {
            mode: 'cors'
          }
        }
      }
    }
  },
  // nitro: { // 활성화시 build되어 hot reload가 정상적으로 작동하지 않는다. dev환경에서는 undefined로 지정되게 하자.
  //   minify: true,
  //   serveStatic: false // TODO: if need CDN publish
  // },
  devtools: {
    enabled: true
  }
})
