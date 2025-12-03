import { VAlert, VScrollYReverseTransition } from 'vuetify/components'
import styles from '~/assets/styles/pages/index.module.sass'

export default defineNuxtComponent({
  name: 'AlertDisplay',
  setup () {
    const nuxt = useNuxtApp()
    return {
      alertMessage: nuxt.$alert.alertMessage
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
