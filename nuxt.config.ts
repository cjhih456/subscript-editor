// https://v3.nuxtjs.org/api/configuration/nuxt.config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  shadcn: {
    prefix: '',
    componentDir: '@/components/ui'
  },
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
  colorMode: {
    preference: 'dark',
    classSuffix: '',
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
  css: ['@/assets/styles/init.css'],
  runtimeConfig: {
    public: {
      BACKEND_API: 'http://localhost:3000'
    }
  },
  modules: ['@nuxt/devtools', 'nuxt-security', 'dayjs-nuxt', 'shadcn-nuxt', '@nuxtjs/color-mode', '@nuxt/eslint'],
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
  devtools: {
    enabled: true
  }
})