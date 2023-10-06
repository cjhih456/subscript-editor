export default defineNuxtComponent({
  setup () {
    return () => {
      return <form>
        <slot name="default" />
      </form>
    }
  }
})
