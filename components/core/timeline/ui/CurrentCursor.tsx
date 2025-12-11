import { useCursorController } from '../../provider/CursorControllerProvider'
import { useScrollValue } from '../../provider/SubtitleControllerProvider'

export default defineNuxtComponent({
  name: 'CurrentCursor',
  setup () {
    const { mousePosition } = useCursorController()
    const { left: scrollClientLeft, value: scrollValue } = useScrollValue()

    const style = computed(() => {
      return {
        left: mousePosition.value.x + scrollValue.value - scrollClientLeft.value + 'px'
      }
    })

    return { style }
  },
  render () {
    return <div class="absolute top-0 bottom-0 w-[2px] bg-red-300/70 z-10 pointer-events-none" style={this.style}></div>
  }
})
