import type { StorybookConfig } from "@storybook/vue3-vite"
import { loadNuxt, buildNuxt} from '@nuxt/kit'
import { Nuxt, ViteConfig } from "nuxt/schema"
import { mergeConfig, optimizeDeps } from "vite"
import vuePlugin from '@vitejs/plugin-vue';
import viteJsxPlugin from '@vitejs/plugin-vue-jsx';

interface NuxtObjForViteConfig {
  nuxtServer: Nuxt
  viteConfig: ViteConfig
}

const vuePlugins = {
  'vite:vue': [vuePlugin, 'vue'],
  'vite:vue-jsx': [viteJsxPlugin, 'vueJsx'],
}

function loadNuxtOnPrimise() {
  const result = new Promise<NuxtObjForViteConfig>(async (resolve) => {
    const nuxtObj = {
      nuxtServer: undefined
    } as { nuxtServer?: Nuxt}
    nuxtObj.nuxtServer = await loadNuxt({
      ready: false,
      dev: true,
      overrides: {
        pages: false,
        app: {
          rootId: 'nuxt-test'
        },
        vue: {
          runtimeCompiler: true
        }
      }
    })
    nuxtObj.nuxtServer.hook('vite:extendConfig', (viteConfig, {isClient}) => {
      if(isClient) {
        resolve({nuxtServer: nuxtObj.nuxtServer, viteConfig} as NuxtObjForViteConfig)
      }
    })
    await nuxtObj.nuxtServer.ready()
    await buildNuxt(nuxtObj.nuxtServer)
  })
  return result
}

export default {
  stories: [
    "../stories/**/*.stories.mdx",
    "../stories/**/*.stories.@(js|jsx|ts|tsx)",
    "../layouts/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions"
  ],
  core: {
    disableTelemetry: true,
    enableCrashReports: true
  },
  framework: "@storybook/vue3-vite",
  async viteFinal(config) {
    const nuxtObj = await loadNuxtOnPrimise()
    const mergedConfig = mergeConfig({
      ...config,
      plugins: config.plugins?.filter((p) => {
        if(!p) return false
        // @ts-ignore
        switch(p.name) {
          case 'vite:vue':
            return false
          default: return true
        }
      }),
      define: {
        ...config.define,
        global: "window"
      }
    }, {
      css: nuxtObj.viteConfig.css,
      resolve: nuxtObj.viteConfig.resolve,
      // @ts-ignore
      plugins: nuxtObj.viteConfig.plugins,
      vue: nuxtObj.viteConfig.vue,
      vueJsx: nuxtObj.viteConfig.vueJsx,
      optimizeDeps: nuxtObj.viteConfig.optimizeDeps,
      define: nuxtObj.viteConfig.define,
      assetsInclude: nuxtObj.viteConfig.assetsInclude,
    } as ViteConfig)
    delete mergedConfig.esbuild
    mergedConfig.optimizeDeps.include = mergedConfig.optimizeDeps.include.filter(v => v !== 'vue')
    mergedConfig.optimizeDeps.include.push('vue')
    for (const name in vuePlugins) {
      if (!mergedConfig.plugins?.some((p) => (p as any)?.name === name)) {
        const [plugin, key] = vuePlugins[name as keyof typeof vuePlugins];
        // @ts-ignore
        mergedConfig.plugins?.push(plugin(mergedConfig[key]));
        
      }
    }
    // console.log(mergedConfig.resolve)
    return mergedConfig
  },
  features: {
    storyStoreV7: true
  },
  staticDirs: ['../public']
} as StorybookConfig