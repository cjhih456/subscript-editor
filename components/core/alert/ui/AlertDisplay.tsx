import { ClientOnly } from '#components'
import 'vue-sonner/style.css'
import { Toaster } from '~/components/ui/sonner'

export default defineNuxtComponent({
  name: 'AlertDisplay',
  render () {
    return <ClientOnly><Toaster /></ClientOnly>
  }
})
