// https://v3.nuxtjs.org/api/configuration/nuxt.config
import tailwindcss from '@tailwindcss/vite'

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
  build: {
    transpile: ['@ffmpeg/ffmpeg', '@ffmpeg/util']
  },
  vite: {
    optimizeDeps: {
      exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util']
    },
    plugins: [
      tailwindcss()
    ],
    server: {
      headers: {
        permissionsPolicy: 'fullscreen=self',
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp'
      }
    }
  },
  css: ['@/assets/styles/init.sass'],
  runtimeConfig: {
    public: {
      BACKEND_API: 'http://localhost:3000'
    }
  },
  modules: ['@nuxt/devtools', 'nuxt-security', 'dayjs-nuxt'],
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
