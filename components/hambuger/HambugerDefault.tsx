import styles from '~/assets/styles/components/hambuger/HambugerDefault.module.sass'
export default defineNuxtComponent({
  setup () {
    const computedStyles = computed(() => styles)
    return () => {
      return <div class={computedStyles.value['hambuger-default']}>
        <div class={computedStyles.value['left-area']}></div>
        <div class={computedStyles.value['center-area']}></div>
        <div class={computedStyles.value['right-area']}></div>
      </div>
    }
  }
})
