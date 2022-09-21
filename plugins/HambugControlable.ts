export default defineNuxtPlugin((nuxtApp) => {
  return {
    provide: {
      hambuger: {
        name: ref('default'),
        value: ref(true),
        isMini: ref(false),
        changer(value: boolean) {
          if (typeof value !== 'boolean') return nuxtApp.$hambuger.value.value
          nuxtApp.$hambuger.value.value = value
        },
        changeMiniState(value: boolean) {
          if (typeof value !== 'boolean') return nuxtApp.$hambuger.isMini.value
          nuxtApp.$hambuger.isMini.value = value
        },
        hambugerActiveStatu: computed<boolean>(
          () => nuxtApp.$hambuger.value.value
        ),
        hambugerIsMiniStatu: computed<boolean>(
          () => nuxtApp.$hambuger.isMini.value
        ),
        getHambugerComponent() {
          switch (nuxtApp.$hambuger.name) {
            case 'default':
              return
            case 'no-header':
            default:
              return undefined
          }
        },
      },
    },
  }
})
