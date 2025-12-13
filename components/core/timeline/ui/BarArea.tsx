import { useConvertProgress, useScrollValue } from '../../provider/SubtitleControllerProvider'
import { provideCursorController } from '../../provider/CursorControllerProvider'
import { Progress } from '~/components/ui/progress'
import { ClientOnly } from '#components'
import useWaveConverter from '../../file-select/composables/useWaveConverter'

export default defineNuxtComponent({
  name: 'BarArea',
  setup () {
    const scrollArea = useTemplateRef<HTMLDivElement>('scrollArea')
    const { value: scrollValue, left: scrollClientLeft } = useScrollValue()
    const convertProgress = useConvertProgress()

    useWaveConverter()

    provideCursorController(3)

    function windowResizeEvent () {
      if (!scrollArea.value) { return }
      scrollClientLeft.value = scrollArea.value.getBoundingClientRect().left
    }

    function scrollEvent () {
      if (!scrollArea.value) { return }
      scrollValue.value = scrollArea.value.scrollLeft
    }

    onMounted(() => {
      scrollArea.value?.addEventListener('scroll', scrollEvent)
      window.addEventListener('resize', windowResizeEvent, false)
      windowResizeEvent()
    })
    onBeforeUpdate(() => {
      window.removeEventListener('resize', windowResizeEvent, false)
      scrollArea.value?.removeEventListener('scroll', scrollEvent)
    })
    onUpdated(() => {
      window.addEventListener('resize', windowResizeEvent, false)
      scrollArea.value?.addEventListener('scroll', scrollEvent)
    })
    onBeforeUnmount(() => {
      window.removeEventListener('resize', windowResizeEvent, false)
      scrollArea.value?.removeEventListener('scroll', scrollEvent)
    })
    return {
      convertProgress
    }
  },
  render () {
    return <div class="relative overflow-hidden bg-card text-card-foreground border-card-foreground">
      <div ref="scrollArea" class="relative w-full overflow-x-scroll pb-2">
        <div class="sticky top-0 left-0 right-0">
          {this.$slots.canvas?.()}
        </div>
        {this.$slots.cursor?.()}
        {this.$slots.default?.()}
      </div>
      <ClientOnly>
        {
          this.convertProgress > 0 ? (<>
            <div class="absolute top-0 bottom-0 left-0 right-0 bg-gray-500/30 z-10 flex items-center justify-center">
              <div class="flex-1 p-4">
                <Progress class="shadow-xl shadow-primary" modelValue={this.convertProgress} max={100} />
              </div>
            </div>
          </>) : (<></>)
        }
      </ClientOnly>
    </div>
  }
})
