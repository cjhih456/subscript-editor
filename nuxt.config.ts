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
    transpile: ['vuetify', '@ffmpeg/ffmpeg', '@ffmpeg/util']
  },
  vite: {
    optimizeDeps: {
      exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util']
    },
    server: {
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp'
      }
    }
  },
  css: [
    'vuetify/lib/styles/main.sass',
    '@mdi/font/css/materialdesignicons.min.css',
    '@/assets/styles/css/main.css',
    '@/assets/styles/init.sass'
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
  ], '@nuxtjs/storybook', '@nuxt/devtools', 'nuxt-security', 'dayjs-nuxt'],
  dayjs: {
    plugins: ['utc']
  },
  security: {
    headers: {
      crossOriginResourcePolicy: 'cross-origin',
      crossOriginOpenerPolicy: 'same-origin',
      crossOriginEmbedderPolicy: import.meta.env.DEV ? 'unsafe-none' : 'require-corp'
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
