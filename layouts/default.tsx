import { useNuxtApp } from '#app'
import { VApp, VAppBar, VAppBarTitle, VMain } from 'vuetify/components'
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
    const layoutClass = computed(() => ({
      [styleClass.value['default-layout']]: true,
      [styleClass.value['no-hambug']]: !slots.hambug,
      [themeClass.value]: true
    }))
    const mainClass = computed(() => ({
      [styleClass.value['hambug-menu']]: true,
      [styleClass.value['is-mini']]: nuxtApp.$hambuger.isMini,
      active: nuxtApp.$hambuger.value
    }))
    const contentClass = computed(() => ({
      [styleClass.value.content]: true
    }))
    return {
      layoutClass,
      mainClass,
      contentClass,
      toggleHambugMenu
    }
  },
  render () {
    return <VApp class={this.layoutClass}>
      <VAppBar>
        {this.$slots.header ? this.$slots.header({ toggleEvent: this.toggleHambugMenu }) : <VAppBarTitle>Default Header</VAppBarTitle>}
      </VAppBar>
      <VMain>
        <div class={this.mainClass}>
          {this.$slots.hambug
            ? this.$slots.hambug()
            : 'Default hambug2'
          }
        </div>
        <div
          class={this.contentClass}
        >
          {this.$slots.default
            ? this.$slots.default()
            : 'Default content2'
          }
        </div>
      </VMain>
      <div id="dialog-area" />
    </VApp>
  }
})
