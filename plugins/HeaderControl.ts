import HeaderDefault from '~/components/header/HeaderDefault.vue'

export default defineNuxtPlugin((nuxtApp) => {
  return {
    provide: {
      header: {
        headerName: ref('default'),
        getHeaderComponent() {
          switch (nuxtApp.$header.headerName.value) {
            case 'default':
              return HeaderDefault
            case 'no-header':
            default:
              return undefined
          }
        },
        changer(value: string) {
          if (typeof value !== 'string') return nuxtApp.$header.headerName.value
          nuxtApp.$header.headerName.value = value
        },
      },
    },
  }
})
