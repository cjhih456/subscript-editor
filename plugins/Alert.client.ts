import { toast } from 'vue-sonner'

export default defineNuxtPlugin(() => {
  return {
    provide: {
      alert: {
        show (message: string) {
          toast.error(message)
        }
      }
    }
  }
})
