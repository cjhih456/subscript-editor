import { useCurrentTime, usePixPerSec } from '../../provider/SubtitleControllerProvider'

export default defineNuxtComponent({
  name: 'CurrentTimeCursor',
  setup () {
    const currentTime = useCurrentTime()
    const pixPerSec = usePixPerSec()

    const style = computed(() => {
      return {
        left: currentTime.value * pixPerSec.value + 'px'
      }
    })

    return { style }
  },
  render () {
    return <div class="absolute top-0 bottom-0 w-[2px] bg-red-500/70 z-10" style={this.style}></div>
  }
})
