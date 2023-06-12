import { useUserStore } from '~~/stores/UserStore'

export default defineNuxtRouteMiddleware(async () => {
  if (process.client) {
    const userStore = useUserStore()
    const result = await userStore.tokenValid().then(() => {
      console.log('222222')
      return true
    })
    console.log(result)
    return result
  }
})
