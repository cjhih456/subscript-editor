import type { StorybookConfig } from "@storybook/vue3-vite"
import { w as writeTypes } from '../node_modules/nuxi/dist/shared/nuxi.89758cc3.mjs';
import { loadNuxt, buildNuxt } from '@nuxt/kit'
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
        ssr: false,
        app: {
          rootId: 'storybook-root',
        },
        vue: {
          runtimeCompiler: true
        }
      }
    })
    nuxtObj.nuxtServer.hook('modules:done', () => {
      nuxtObj.nuxtServer?.hook('components:extend', (components) => {
        for (const name of ['NuxtLink']) {
          Object.assign(components.find((c) => c.pascalName === name) || {}, {
            export: name,
            filePath: './components.mjs',
          });
        }
      });
      nuxtObj.nuxtServer?.hook('vite:extendConfig', (viteConfig, {isClient}) => {
        if(isClient) {
          resolve({nuxtServer: nuxtObj.nuxtServer, viteConfig} as NuxtObjForViteConfig)
        }
      })
    })
    
    await nuxtObj.nuxtServer.ready()
    await writeTypes(nuxtObj.nuxtServer)
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
    // console.log(nuxtObj.viteConfig.)
    const mergedConfig = mergeConfig({
      resolve: nuxtObj.viteConfig.resolve,
      optimizeDeps: nuxtObj.viteConfig.optimizeDeps,
      plugins: nuxtObj.viteConfig.plugins,
      define: nuxtObj.viteConfig.define,
      vue: nuxtObj.viteConfig.vue,
      vueJsx: nuxtObj.viteConfig.vueJsx
    }, config)
    // for (const name in vuePlugins) {
    //   if (!mergedConfig.plugins?.some((p) => (p as any)?.name === name)) {
    //     const [plugin, key] = vuePlugins[name as keyof typeof vuePlugins];
    //     // @ts-ignore
    //     mergedConfig.plugins?.push(plugin(mergedConfig[key]));
    //   }
    // }

    return mergedConfig
  },
  docs: {
    autodocs: true,
  },
  features: {
    storyStoreV7: true
  },
  staticDirs: ['../public'],
} as StorybookConfig