// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  compatibilityDate: '2025-06-05',
  app: {
    head: import.meta.env.DEV
      ? {
          charset: 'utf-8'
        }
      : {
          charset: 'utf-8',
          link: [
            {
              as: 'script',
              rel: 'preload',
              href: './worker.js',
              crossorigin: 'use-credentials',
              integrity: 'sha384-rQEcC031XfytcqUuCLKA3ijYnmFEz247ZPEv1Abi7USpTphR8b6kyepOyI55QKv9'
            }
          ],
          script: [{ src: './worker.js', crossorigin: 'use-credentials', integrity: 'sha384-rQEcC031XfytcqUuCLKA3ijYnmFEz247ZPEv1Abi7USpTphR8b6kyepOyI55QKv9' }]
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
    '@/assets/styles/css/main.css',
    '@/assets/styles/init.sass',
    'video.js/dist/video-js.css'
  ],
  runtimeConfig: {
    public: {
      BACKEND_API: 'http://localhost:3000'
    }
  },
  modules: ['@nuxtjs/storybook', '@nuxt/devtools', 'nuxt-security', 'dayjs-nuxt', 'vuetify-nuxt-module'],
  vuetify: {
    moduleOptions: {
      importComposables: true,
      styles: {
        configFile: 'assets/styles/variable/custom-vuetify.scss'
      }
    },
    vuetifyOptions: {
      theme: false,
      directives: true,
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
    sri: true,
    removeLoggers: false,
    headers: {
      crossOriginResourcePolicy: 'cross-origin',
      crossOriginOpenerPolicy: 'same-origin',
      crossOriginEmbedderPolicy: 'require-corp',
      permissionsPolicy: {
        fullscreen: 'self'
      }
    },
    corsHandler: {
      origin: '*',
      methods: '*',
      allowHeaders: '*'
    }
  },
  storybook: {
    port: 6006
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
