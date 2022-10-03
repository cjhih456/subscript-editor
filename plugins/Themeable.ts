export default defineNuxtPlugin(() => {
  return {
    provide: {
      theme: {
        value: ref('light'),
        changer (value?: string) {
          if (typeof value === 'undefined' || !value) { return this.value.value }
          this.value.value = value
        }
      }
    }
  }
})
export const mixinProps = {
  theme: String
}
export const mixin = function ThemeMixin (props: any) {
  const nuxtApp = useNuxtApp()
  const lazyTheme = computed<string>(
    () => props.theme || nuxtApp.$theme.value.value
  )
  const themeClass = computed<string>(() => `${lazyTheme.value}--theme`)
  return {
    props,
    lazyTheme,
    themeClass
  }
}
