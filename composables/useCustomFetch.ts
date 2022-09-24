import { FetchOptions } from 'ohmyfetch'

export const fetchData = function (
  method: string,
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
    if (values.findIndex((v) => v instanceof Blob) !== -1) {
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

export const useCustomFetch = (url: string, options?: FetchOptions<'json'>) => {
  return useFetch(url, {
    ...options,
    // eslint-disable-next-line require-await
    async onResponse() {
      // { request, response, options }
      console.log('[fetch response]')
    },
    // eslint-disable-next-line require-await
    async onResponseError() {
      // { request, response, options }
      console.log('[fetch response error]')
    },
    // eslint-disable-next-line require-await
    async onRequest() {
      // { request, options }
      console.log('[fetch request]')
    },
    // eslint-disable-next-line require-await
    async onRequestError() {
      // { request, options, error }
      console.log('[fetch request error]')
    },
  })
}
