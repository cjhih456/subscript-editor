
export default defineNuxtComponent({
  name: 'DefaultLayout',
  render () {
    return <section class="tw-h-full tw-flex tw-flex-col tw-relative">
      <head class="tw-sticky tw-top-0 tw-z-10">
        {this.$slots.header?.()}
      </head>
      <main>
        {this.$slots.default?.()}
      </main>
    </section>
  }
})
