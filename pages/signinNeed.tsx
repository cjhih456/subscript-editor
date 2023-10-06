export default defineNuxtComponent({
  name: 'SigninNeed',
  setup () {
    definePageMeta({
      middleware: ['user-info-check']
    })
    return () => {
      return <div>need login</div>
    }
  }
})
