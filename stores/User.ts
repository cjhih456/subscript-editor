import { acceptHMRUpdate, defineStore } from 'pinia'
import { useAuthStore } from './Auth'

export const useUserDataStore = defineStore('UserData', () => {
  const dataStore = reactive<{ [key: number]: UserInfo | undefined }>({})

  const takeUserInfo = computed(() => {
    function fn(key: number): UserInfo | undefined
    // eslint-disable-next-line no-redeclare
    function fn(key: number[]): (UserInfo | undefined)[]
    // eslint-disable-next-line no-redeclare
    function fn (key: number[] | number) {
      return Array.isArray(key)
        ? key.map(k => dataStore[k]).filter(Boolean)
        : dataStore[key]
    }
    return fn
  })
  function setUserData (userData: UserInfo) {
    if (dataStore[userData.idx]) {
      Object.assign(dataStore[userData.idx] as UserInfo, userData)
    } else {
      dataStore[userData.idx] = userData
    }
  }

  return { dataStore, takeUserInfo, setUserData }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserDataStore, import.meta.hot))
}

export const useUserStore = defineStore('User', () => {
  const userDataStore = useUserDataStore()
  const authStore = useAuthStore()
  const publicConfig = useRuntimeConfig()
  const userAccessToken = useCookie('userAccess', {
    secure: true,
    sameSite: 'lax',
    domain: publicConfig.public.PAGE_LOCALE,
    expires: new Date('9999 12-31')
  })
  const userRefreshToken = useCookie('userRefresh', {
    secure: true,
    sameSite: 'lax',
    domain: publicConfig.public.PAGE_LOCALE,
    expires: new Date('9999 12-31')
  })
  const userAccessTokenActive = computed(() => {
    return userAccessToken.value
  })
  const userRefreshTokenActive = computed(() => {
    return userRefreshToken.value
  })
  const loginUserData = computed(() => {
    return (
      (authStore.jwtInfo?.idx && userDataStore.dataStore[authStore.jwtInfo?.idx]) ||
      undefined
    )
  })
  function setTokenInfo (access: string, refresh: string) {
    userAccessToken.value = access
    userRefreshToken.value = refresh
  }
  function loginUser (email: String, password: String) {
    return authStore.takeToken(email, password)
  }
  function checkAccount (email: string) {
    return useCustomFetch('/account/check_account', {
      method: 'post',
      body: JSON.stringify({
        email
      })
    }).then((result: any) => {
      return result.code === 200
    })
  }
  function emailVerifyRequest (
    email: string,
    type: 'reset_password' | 'signup',
    lang: 'ko' | 'eng'
  ) {
    return useCustomFetch('/account/send_mail', {
      method: 'post',
      body: JSON.stringify({
        email,
        type,
        lang
      })
    }).then((result: any) => {
      return result.code === 200
    })
  }
  function emailVerifyCode (
    email: string,
    code: string | number,
    type: 'signup' | 'reset_password'
  ) {
    const fullText = new TextEncoder().encode(String(email) + String(code))
    return crypto.subtle.digest('SHA-256', fullText).then((hashBuffer) => {
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hex = hashArray.map(bytes => bytes.toString(16).padStart(2, '0')).join('')
      return useCustomFetch('/account/verify_code', {
        method: 'get',
        query: {
          email,
          code,
          hash: hex,
          type
        }
      }).then((result: any) => {
        return result.code === 200 && result.data
      })
    })
  }
  function passwordReset (email: string, pw: string, token: string) {
    return useCustomFetch('/account/reset_pw', {
      method: 'post',
      body: {
        email,
        pw,
        token
      }
    })
  }
  function signupAction (email: string, pw: string, token: string) {
    return useCustomFetch('/account/create_user', {
      method: 'post',
      body: {
        email,
        pw,
        token
      }
    }).then((result: any) => {
      return result
    })
  }
  function logoutAction () {
    // return useCustomFetch('/account/')
    setTokenInfo('', '')
    authStore.jwtInfo = undefined
    return Promise.resolve()
  }
  return {
    loginUserData,
    userAccessTokenActive,
    userRefreshTokenActive,
    loginUser,
    checkAccount,
    emailVerifyRequest,
    emailVerifyCode,
    passwordReset,
    signupAction,
    setTokenInfo,
    logoutAction
  }
})
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
}
