import { useCursorController } from '../../provider/CursorControllerProvider'
import { useScrollValue } from '../../provider/SubtitleControllerProvider'

export default defineNuxtComponent({
  name: 'CurrentCursor',
  setup () {
    const { mousePosition } = useCursorController()
    const { left: scrollClientLeft } = useScrollValue()

    const style = computed(() => {
      return {
        left: mousePosition.value.x - scrollClientLeft.value + 'px'
      }
    })

    return { style }
  },
  render () {
    return <div class="tw-absolute tw-top-0 tw-bottom-0 tw-w-[2px] tw-bg-red-300/70 tw-z-10 tw-pointer-events-none" style={this.style}></div>
  }
})
