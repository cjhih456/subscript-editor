export default defineNuxtPlugin(() => {
  const alertMessage = ref<string[]>([])
  return {
    provide: {
      alert: {
        alertMessage: computed(() => alertMessage.value),
        show (message: string) {
          alertMessage.value.push(message)
          setTimeout(() => {
            alertMessage.value.shift()
          }, 2000)
        }
      }
    }
  }
})
