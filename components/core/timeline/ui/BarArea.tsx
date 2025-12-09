import { useScrollValue } from '../../provider/SubtitleControllerProvider'
import { provideCursorController } from '../../provider/CursorControllerProvider'

export default defineNuxtComponent({
  name: 'BarArea',
  setup () {
    const scrollArea = useTemplateRef<HTMLDivElement>('scrollArea')
    const { value: scrollValue, left: scrollClientLeft } = useScrollValue()

    provideCursorController(3)

    function windowResizeEvent () {
      if (!scrollArea.value) { return }
      scrollClientLeft.value = scrollArea.value.getBoundingClientRect().left
    }

    onMounted(() => {
      if (!scrollArea.value) { return }
      scrollArea.value.addEventListener('scroll', () => {
        if (!scrollArea.value) { return }
        scrollValue.value = scrollArea.value.scrollLeft
      })
      window.addEventListener('resize', windowResizeEvent, false)
      windowResizeEvent()
    })
    onBeforeUpdate(() => {
      window.removeEventListener('resize', windowResizeEvent, false)
    })
    onUpdated(() => {
      window.addEventListener('resize', windowResizeEvent, false)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('resize', windowResizeEvent, false)
    })
  },
  render () {
    return <div class="overflow-hidden">
      <div ref="scrollArea" class="relative w-full overflow-x-scroll pb-2">
        <div class="sticky top-0 left-0 right-0 overflow-hidden">
          {this.$slots.canvas?.()}
        </div>
        {this.$slots.cursor?.()}
        {this.$slots.default?.()}
      </div>
    </div>
  }
})
