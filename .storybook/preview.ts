/**
 * Origins: @storybook/vue3, nuxt 
 * Links: 
 * https://github.com/storybookjs/storybook/blob/next/code/renderers/vue3/src/render.ts
 */
/* eslint-disable no-param-reassign */
import { App, ConcreteComponent, nextTick, shallowRef, createVNode, render as vueRendering } from 'vue';
import { createApp, h, reactive, isVNode, isReactive } from 'vue';
import type { ArgsStoryFn, RenderContext } from '@storybook/types';
import type { Args, StoryContext } from '@storybook/csf';
import type { VueRenderer } from '@storybook/vue3';
import '#build/css';
// @ts-ignore
import _plugins from "#build/plugins";
import { NuxtApp, applyPlugins, createNuxtApp, normalizePlugins } from 'nuxt/app';

type StoryID = string;
type StoryFnVueReturnType = ConcreteComponent<any>
// console.log(_plugins)
const plugins = normalizePlugins(_plugins);
console.log(plugins)
const vueApp = createApp({
  setup() {
    const args = reactive({})
    const context = shallowRef()
    return context.value ? h(context.value) : h('div')
  }
})
const nuxtApp: NuxtApp = await createNuxtApp({vueApp})
try {
  await applyPlugins(nuxtApp, plugins.filter(v => {
    switch(v.meta?.name) {
      case 'nuxt:router':
      case 'nuxt:chunk-reload':
        return false
      default:
        return true
    }
  }));
} catch (err) {
  await nuxtApp.callHook("app:error", err);
  nuxtApp.payload.error = nuxtApp.payload.error || err;
}
try {
  await nuxtApp.hooks.callHook("app:created", vueApp);
  await nuxtApp.hooks.callHook("app:beforeMount", vueApp);
  await nuxtApp.hooks.callHook("app:mounted", vueApp);
  await nextTick();
} catch (err) {
  await nuxtApp.callHook("app:error", err);
  nuxtApp.payload.error = nuxtApp.payload.error || err;
}

export const render: ArgsStoryFn<VueRenderer> = (props, context) => {
  const { id, component: Component } = context;
  if (!Component) {
    throw new Error(
      `Unable to render story ${id} as the component annotation is missing from the default export`
    );
  }

  return () => h(Component, props, generateSlots(context));
};

// set of setup functions that will be called when story is created
const setupFunctions = new Set<(app: App, storyContext?: StoryContext<VueRenderer>) => void>();
/** add a setup function to set that will be call when story is created a d
 *
 * @param fn
 */
export const setup = (fn: (app: App, storyContext?: StoryContext<VueRenderer>) => void) => {
  console.log(fn)
  setupFunctions.add(fn);
};

const runSetupFunctions = (app: App, storyContext: StoryContext<VueRenderer>) => {
  setupFunctions.forEach((fn) => fn(app, storyContext));
};

const map = new Map<
  VueRenderer['canvasElement'] | StoryID,
  {
    vueApp: ReturnType<typeof createApp>;
    reactiveArgs: Args;
    reactiveSlots?: Args;
  }
>();

export async function renderToCanvas(
  { storyFn, forceRemount, showMain, showException, storyContext, id }: RenderContext<VueRenderer>,
  canvasElement: VueRenderer['canvasElement']
) {
  const existingApp = map.get(canvasElement);

  // if the story is already rendered and we are not forcing a remount, we just update the reactive args
  if (existingApp && !forceRemount) {
    // normally storyFn should be call once only in setup function,but because the nature of react and how storybook rendering the decorators
    // we need to call here to run the decorators again
    // i may wrap each decorator in memoized function to avoid calling it if the args are not changed
    const element = storyFn(); // call the story function to get the root element with all the decorators
    const args = getArgs(element, storyContext); // get args in case they are altered by decorators otherwise use the args from the context

    updateArgs(existingApp.reactiveArgs, args);
    return () => {
      teardown(existingApp.vueApp, canvasElement);
    };
  }
  if (existingApp && forceRemount) teardown(existingApp.vueApp, canvasElement);
  

  // create vue app for the story
  // const vueChildApp = createApp({
  //   setup() {
  //     storyContext.args = reactive(storyContext.args);
  //     const rootElement = storyFn(); // call the story function to get the root element with all the decorators
  //     const args = getArgs(rootElement, storyContext); // get args in case they are altered by decorators otherwise use the args from the context
  //     const appState = {
  //       vueApp,
  //       reactiveArgs: reactive(args),
  //     };
  //     map.set(canvasElement, appState);

  //     return () => {
  //       // not passing args here as props
  //       // treat the rootElement as a component without props
  //       return h(rootElement);
  //     };
  //   },
  // });
  // vueChildApp.config.errorHandler = (e: unknown) => showException(e as Error);
  // runSetupFunctions(vueChildApp, storyContext);
  const rootElement = storyFn()
  const vNode = createVNode(rootElement)
  if(nuxtApp && nuxtApp.vueApp && nuxtApp.vueApp._context ) vNode.appContext = nuxtApp.vueApp._context
  vueRendering(vNode, canvasElement)
  showMain();
  return () => {
    // teardown(vNode, canvasElement);
  };
}

/**
 * generate slots for default story without render function template
 * @param context
 */

function generateSlots(context: StoryContext<VueRenderer, Args>) {
  const { argTypes } = context;
  const slots = Object.entries(argTypes)
    .filter(([key, value]) => argTypes[key]?.table?.category === 'slots')
    .map(([key, value]) => {
      const slotValue = context.args[key];
      return [key, typeof slotValue === 'function' ? slotValue : () => slotValue];
    });

  return reactive(Object.fromEntries(slots));
}
/**
 * get the args from the root element props if it is a vnode otherwise from the context
 * @param element is the root element of the story
 * @param storyContext is the story context
 */

function getArgs(element: StoryFnVueReturnType, storyContext: StoryContext<VueRenderer, Args>) {
  return element.props && isVNode(element) ? element.props : storyContext.args;
}

/**
 *  update the reactive args
 * @param reactiveArgs
 * @param nextArgs
 * @returns
 */
export function updateArgs(reactiveArgs: Args, nextArgs: Args) {
  if (Object.keys(nextArgs).length === 0) return;
  const currentArgs = isReactive(reactiveArgs) ? reactiveArgs : reactive(reactiveArgs);
  // delete all args in currentArgs that are not in nextArgs
  Object.keys(currentArgs).forEach((key) => {
    if (!(key in nextArgs)) {
      delete currentArgs[key];
    }
  });
  // update currentArgs with nextArgs
  Object.assign(currentArgs, nextArgs);
}

/**
 * unmount the vue app
 * @param storybookApp
 * @param canvasElement
 * @returns void
 * @private
 * */

function teardown(
  storybookApp: ReturnType<typeof createApp>,
  canvasElement: VueRenderer['canvasElement']
) {
  storybookApp?.unmount();
  if (map.has(canvasElement)) map.delete(canvasElement);
}