import { acceptHMRUpdate, defineStore } from 'pinia'
import { useUserStore } from './User'

export const useAuthStore = defineStore('Auth', () => {
  const userStore = useUserStore()

  const jwtInfo = ref<TokenInfo | undefined>(undefined)
  function takeToken (email: String, password: String) {
    return useCustomFetch('/auth/do_login', {
      method: 'post',
      body: JSON.stringify({
        email,
        pw: password,
        platform: 'web'
      })
    }).then((result: any) => {
      if (result.code === 200) {
        userStore.setTokenInfo(result.data.access, result.data.refresh)
      }
      return result
    })
  }
  function tokenVerify () {
    if (jwtInfo.value) {
      if (jwtInfo.value.exp > Date.now() / 1000) {
        return Promise.resolve(true)
      }
    }
    return useCustomFetch('/auth/verify_access_token', { method: 'post' })
      .then((result: any) => {
        jwtInfo.value = result.data as TokenInfo
        if (jwtInfo.value.exp > Date.now() / 1000) {
          return true
        }
        return false
      })
      .catch(() => {
        return false
      })
  }

  function tokenRefresh () {
    return useCustomFetch('/auth/refresh_access_token', {
      method: 'post',
      body: JSON.stringify({
        refresh_token: userStore.userRefreshTokenActive
      })
    }).then((result: any) => {
      userStore.setTokenInfo(result.data, userStore.userRefreshTokenActive || '')
      return true
    })
  }

  return {
    jwtInfo,
    takeToken,
    tokenVerify,
    tokenRefresh
  }
})
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}
