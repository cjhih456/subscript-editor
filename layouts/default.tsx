import { useNuxtApp } from '#app'
import { mixin, mixinProps } from '~/plugins/Themeable'
import styles from '~/assets/styles/layouts/default.module.sass'

export default defineNuxtComponent({
  name: 'DefaultLayout',
  props: mixinProps,
  setup (props, { slots }) {
    const { themeClass } = mixin(props)
    const nuxtApp = useNuxtApp()
    const styleClass = computed(() => styles)
    function toggleHambugMenu () {
      nuxtApp.$hambuger.changer(!nuxtApp.$hambuger.value)
    }
    const layoutClass = {
      [styleClass.value['default-layout']]: true,
      [styleClass.value['no-hambug']]: !slots.hambug,
      [themeClass.value]: true
    }
    const mainClass = {
      [styleClass.value['hambug-menu']]: true,
      [styleClass.value['is-mini']]: nuxtApp.$hambuger.isMini,
      active: nuxtApp.$hambuger.value
    }
    return () => {
      return <div class={layoutClass}>
        <header>
          {slots.header ? slots.header({ toggleEvent: toggleHambugMenu }) : ('Default Header')}
        </header>
        <main>
          <div class={mainClass}>
          {slots.hambug
            ? slots.hambug()
            : 'Default hambug'
          }
          </div>
          <div
            class={styleClass.value.content}
          >
            {slots.default
              ? slots.default()
              : 'Default content'
          }
          </div>
        </main>
        <div id="dialog-area" />
      </div>
    }
  }
})
