import { HambugerDefault } from '#components'

export default defineNuxtPlugin(() => {
  const name = ref<'default' | 'no-hambug'>('default')
  const value = ref(true)
  const isMini = ref(false)
  return {
    provide: {
      hambuger: {
        name,
        value,
        isMini,
        changer: (v: boolean) => {
          if (typeof v !== 'boolean') { return value.value }
          value.value = v
        },
        changeMiniState (value: boolean) {
          if (typeof value !== 'boolean') { return isMini.value }
          isMini.value = value
        },
        hambugerActiveStatu: computed<boolean>(
          () => value.value
        ),
        hambugerIsMiniStatu: computed<boolean>(
          () => isMini.value
        ),
        getHambugerComponent () {
          switch (name.value) {
            case 'default':
              return HambugerDefault
            case 'no-hambug':
            default:
              return undefined
          }
        }
      }
    }
  }
})
