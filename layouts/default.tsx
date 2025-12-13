import { provideSubtitleController } from "~/components/core/provider/SubtitleControllerProvider"

export default defineNuxtComponent({
  name: 'DefaultLayout',
  setup () {
    provideSubtitleController()
  },
  render () {
    return <section class="h-full min-h-screen flex flex-col relative">
      <header class="sticky top-0 z-10">
        {this.$slots.header?.()}
      </header>
      <main class="flex-1 flex flex-col">
        {this.$slots.default?.()}
      </main>
    </section>
  }
})
