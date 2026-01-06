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
          charset: 'utf-8',
          meta: [
            {
              'http-equiv': 'Cross-Security-Policy',
              content: 'unsafe-eval'
            }
          ]
        }
      : {
          charset: 'utf-8',
          link: [
            {
              as: 'script',
              rel: 'preload',
              href: './worker.js',
              crossorigin: 'use-credentials',
              integrity: 'sha384-tA5I4nRCst+/8GlgPEWF5KUEZ1hXD739JJrMr++7oGtz8enYsOz821pP/a/rToEy'
            }
          ],
          script: [{ src: './worker.js', crossorigin: 'use-credentials', integrity: 'sha384-tA5I4nRCst+/8GlgPEWF5KUEZ1hXD739JJrMr++7oGtz8enYsOz821pP/a/rToEy' }]
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
        'Cross-Origin-Embedder-Policy': 'require-corp',
      }
    }
  },
  css: ['@/assets/styles/init.css'],
  runtimeConfig: {
    public: {
      BACKEND_API: 'http://localhost:3000'
    }
  },
  modules: ['@nuxt/devtools', 'nuxt-security', 'dayjs-nuxt', 'shadcn-nuxt', '@nuxtjs/color-mode', '@nuxt/eslint', 'motion-v/nuxt'],
  features: {
    inlineStyles: false
  },
  dayjs: {
    plugins: ['utc', 'customParseFormat', 'duration']
  },
  security: {
    sri: true,
    enabled: true,
    removeLoggers: false,
    headers: {
      crossOriginResourcePolicy: 'cross-origin',
      crossOriginOpenerPolicy: 'same-origin',
      crossOriginEmbedderPolicy: 'require-corp',
      contentSecurityPolicy: {
        'script-src': ["'self'", "'wasm-unsafe-eval'", "'unsafe-inline'"],
        'worker-src': ["'self'", "blob:", "https://cdn.jsdelivr.net/npm/"],
        'script-src-elem': ["'self'", "'unsafe-inline'", 'blob:'],
      },
      permissionsPolicy: {
        fullscreen: 'self',
        
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
      }
    }
  },
  devtools: {
    enabled: true
  }
})