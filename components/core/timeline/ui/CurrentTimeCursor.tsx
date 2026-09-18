import { useCurrentTime, usePixPerSec } from '../../provider/SubtitleControllerProvider'

export default defineNuxtComponent({
  name: 'CurrentTimeCursor',
  setup () {
    const currentTime = useCurrentTime()
    const pixPerSec = usePixPerSec()
    const prefersReducedMotion = ref(false)

    onMounted(() => {
      const media = window.matchMedia('(prefers-reduced-motion: reduce)')
      prefersReducedMotion.value = media.matches
      const onChange = () => {
        prefersReducedMotion.value = media.matches
      }
      media.addEventListener('change', onChange)
      onBeforeUnmount(() => {
        media.removeEventListener('change', onChange)
      })
    })

    const style = computed(() => {
      return {
        left: currentTime.value * pixPerSec.value + 'px',
        opacity: prefersReducedMotion.value ? 1 : 0.85
      }
    })

    return { style, prefersReducedMotion }
  },
  render () {
    return <div
      class="absolute top-0 bottom-0 z-10 w-[2px] bg-[#EC4899]"
      style={this.style}
      aria-hidden="true"
    />
  }
})
