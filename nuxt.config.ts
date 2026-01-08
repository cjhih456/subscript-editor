// https://v3.nuxtjs.org/api/configuration/nuxt.config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  shadcn: {
    prefix: '',
    componentDir: '@/components/ui'
  },
  app: {
    head: process.env.NODE_ENV === 'development'
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
              integrity: 'sha384-046adxJc2ue3emaMBEbrcjJqV/2PUo1/t23DmsIdjVKlcbEo3fXqc1MazLRPipni'
            }
          ],
          script: [{ src: './worker.js', crossorigin: 'use-credentials', integrity: 'sha384-046adxJc2ue3emaMBEbrcjJqV/2PUo1/t23DmsIdjVKlcbEo3fXqc1MazLRPipni' }]
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
    runtimeConfig: {
      security: {
        headers: {
          crossOriginResourcePolicy: 'cross-origin',
          crossOriginOpenerPolicy: 'same-origin',
          crossOriginEmbedderPolicy: 'require-corp',
          contentSecurityPolicy: {
            'script-src': ["'self'", "'wasm-unsafe-eval'", "'unsafe-inline'"],
            'worker-src': ["'self'", "blob:", "https://cdn.jsdelivr.net/npm/"],
            'script-src-elem': ["'self'", "'unsafe-inline'", 'blob:'],
          },
        }
      }
    },
    routeRules: {
      '/_nuxt/**': {
        headers: {
          crossOriginResourcePolicy: 'cross-origin',
          crossOriginOpenerPolicy: 'same-origin',
          crossOriginEmbedderPolicy: 'require-corp',
        }
      }
    }
  },
  devtools: {
    enabled: true
  }
})