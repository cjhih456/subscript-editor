import { useNuxtApp } from '#app'
import { NuxtLink, DialogCDialog, FormsSecondInput as SecondInput, FormsInput as Input } from '#components'
import styles from '~~/assets/styles/pages/index.module.sass'
export default defineNuxtComponent({
  name: 'IndexPage',
  setup () {
    const stylesComputed = computed(() => styles)
    const inputValue = ref<any>('')
    function changeTheme () {
      const nuxtApp = useNuxtApp()
      if (nuxtApp.$theme.changer() === 'light') {
        nuxtApp.$theme.changer('dark')
      } else {
        nuxtApp.$theme.changer('light')
      }
    }
    function changeHeader () {
      const nuxtApp = useNuxtApp()
      if (nuxtApp.$header.getHeaderComponent()) {
        nuxtApp.$header.changer('no-header')
      } else {
        nuxtApp.$header.changer('default')
      }
    }
    return () => <div>
      isDefault
      <Input v-model={inputValue.value} />
      <SecondInput v-model={inputValue.value} />
      <button class="" onClick={changeTheme}>
        change Theme
      </button>
      <button class="" onClick={changeHeader}>
        change header
      </button>
      <div class={stylesComputed.value['dialog-area']}>

        <DialogCDialog fixed>{{
          default: () => <span>aaaaaa</span>,
          activator: ({ clickAction }: {clickAction: (v:MouseEvent) => void}) => <button onClick={clickAction}>activator</button>
        }}</DialogCDialog>
      </div>
      <NuxtLink to={{ name: 'signinNeed' }}>
        aaaaddddd
      </NuxtLink>
    </div>
  }
})
