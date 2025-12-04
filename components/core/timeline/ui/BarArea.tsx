import { useScrollValue } from '../../provider/SubtitleControllerProvider'

export default defineNuxtComponent({
  name: 'BarArea',
  setup () {
    const scrollArea = useTemplateRef<HTMLDivElement>('scrollArea')
    const { value: scrollValue } = useScrollValue()

    onMounted(() => {
      if (!scrollArea.value) { return }
      scrollArea.value.addEventListener('scroll', () => {
        if (!scrollArea.value) { return }
        scrollValue.value = scrollArea.value.scrollLeft
      })
    })
  },
  render () {
    return <div class="tw-overflow-hidden">
      <div ref="scrollArea" class="tw-relative tw-w-full tw-overflow-x-scroll tw-pb-2">
        <div class="tw-sticky tw-top-0 tw-left-0 tw-right-0 tw-overflow-hidden">
          {this.$slots.canvas?.()}
        </div>
        {this.$slots.default?.()}
      </div>
    </div>
  }
})
