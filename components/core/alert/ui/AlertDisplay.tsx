import { VAlert, VScrollYReverseTransition } from 'vuetify/components'
import styles from '~/assets/styles/pages/index.module.sass'

export default defineNuxtComponent({
  name: 'AlertDisplay',
  setup () {
    const nuxt = useNuxtApp()
    const alertMessage = computed(() => {
      return import.meta.env.SSR ? [] : nuxt.$alert.alertMessage.value
    })
    return {
      alertMessage
    }
  },
  render () {
    return <VScrollYReverseTransition>
      {this.alertMessage.map((message: string, index: number) => (
        <VAlert key={index} class={styles.alert} title={message} />
      ))}
    </VScrollYReverseTransition>
  }
})
