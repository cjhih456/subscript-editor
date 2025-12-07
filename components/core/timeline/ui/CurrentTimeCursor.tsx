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
    return <div class="tw-absolute tw-top-0 tw-bottom-0 tw-w-[2px] tw-bg-red-500/70 tw-z-10" style={this.style}></div>
  }
})
