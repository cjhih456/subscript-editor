import { HeaderDefault } from '#components'
export default defineNuxtPlugin(() => {
  const headerName = ref('default')
  return {
    provide: {
      header: {
        headerName,
        getHeaderComponent () {
          switch (headerName.value) {
            case 'default':
              return HeaderDefault
            case 'no-header':
            default:
              return undefined
          }
        },
        changer (value: string) {
          if (typeof value !== 'string') { return headerName.value }
          headerName.value = value
        }
      }
    }
  }
})
