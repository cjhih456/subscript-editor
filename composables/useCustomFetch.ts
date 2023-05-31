import { $Fetch, FetchOptions } from 'ohmyfetch'
import { useAuthStore } from '~~/stores/Auth'
import { useUserStore } from '~~/stores/User'

type ApiMethod = 'get' | 'head' | 'patch' | 'post' | 'put' | 'delete' | 'connect' | 'options' | 'trace'

export const fetchData = function (
  method: ApiMethod,
  data: { [key: string]: any }
): String | FormData | { [key: string]: any } | null {
  const values = Object.values(data)
  if (method === 'get') {
    const dataBuffer = {} as { [key: string]: any }
    Object.keys(data).forEach((v) => {
      if (
        typeof data[v] === 'boolean' ||
        typeof data[v] === 'string' ||
        typeof data[v] === 'object' ||
        Array.isArray(data[v]) ||
        typeof data[v] === 'number'
      ) {
        dataBuffer[v] = data[v]
      }
    })
    return dataBuffer
  } else if (method === 'post') {
    if (values.findIndex(v => v instanceof Blob || v instanceof File) === -1) {
      return JSON.stringify(data)
    }
    const formData = new FormData()
    Object.keys(data).forEach((v) => {
      formData.append(v, data[v])
    })
    return formData
  }
  return null
}

interface CustomFetch {
  fetch: Promise<$Fetch>
  tokenRefreshNeed: boolean
}

function customFetch (url: string, options?: FetchOptions<'json'> & {method: ApiMethod}) {
  const userStore = useUserStore()
  const authStore = useAuthStore()
  const config = useRuntimeConfig()
  const ctx = {
    fetch: $fetch(url, {
      ...options,
      keepalive: true,
      baseURL: config.public.BACKEND_API,
      cache: 'no-cache',
      // eslint-disable-next-line require-await
      // async onResponse() {
      //   // { request, response, options }
      //   console.log('[fetch response]')
      // },
      // eslint-disable-next-line require-await
      async onResponseError ({ response }) {
        // { request, response, options }
        if (
          response.status === 403 ||
          (response.status === 400 &&
            response._data.code === userStore.userAccessTokenActive)
        ) {
          ctx.tokenRefreshNeed = await authStore.tokenRefresh()
        }
      },
      // eslint-disable-next-line require-await
      async onRequest ({ options }) {
        if (userStore.userAccessTokenActive) {
          options.headers = options.headers
            ? {
                ...options.headers,
                access_token: userStore.userAccessTokenActive.value || ''
              }
            : {
                access_token: userStore.userAccessTokenActive.value || ''
              }
        }
      }
      // eslint-disable-next-line require-await
      // async onRequestError() {
      //   { request, options, error }
      //   console.log('[fetch request error]')
      // },
    }),
    tokenRefreshNeed: false
  } as CustomFetch
  return ctx
}

export const useCustomFetch = (url: string, options?: FetchOptions<'json'> & {method: ApiMethod}) => {
  // let tokenRefreshNeed = false
  // https://github.com/unjs/ohmyfetch
  const ctx = customFetch(url, options)
  return ctx.fetch.catch(async () => {
    if (ctx.tokenRefreshNeed) {
      const ctxRetry = await customFetch(url, options)
      return ctxRetry.fetch
    }
    return ctx.fetch
  })

  // await ctx.execute()
  // if (ctx.error && tokenRefreshNeed) {
  //   await ctx.refresh()
  // }
  // if (ctx.error && ctx.error.value) {
  //   throw ctx.error.value
  // }
  // return ctx.data.value
}
