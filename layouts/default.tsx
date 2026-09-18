import { provideSubtitleController } from "~/components/core/provider/SubtitleControllerProvider"
import { provideWhisperProvider } from "~/components/core/whisper"

export default defineNuxtComponent({
  name: 'DefaultLayout',
  setup () {
    provideSubtitleController()
    provideWhisperProvider()
  },
  render () {
    return <section class="relative flex h-screen min-h-screen flex-col overflow-hidden">
      <header class="z-10 shrink-0">
        {this.$slots.header?.()}
      </header>
      <main class="flex min-h-0 flex-1 flex-col">
        {this.$slots.default?.()}
      </main>
    </section>
  }
})
