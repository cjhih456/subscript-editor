import { useCueStore, useDuration, usePixPerSec, useScrollValue } from '../../provider/SubtitleControllerProvider'
import Cue from './Cue'

export default defineNuxtComponent({
  name: 'CueBar',
  setup () {
    const scrollValue = useScrollValue()
    const scrollArea = useTemplateRef<HTMLDivElement>('scrollArea')
    const { allIds } = useCueStore()
    const duration = useDuration()
    const pixPerSec = usePixPerSec()

    onMounted(() => {
      if (!scrollArea.value) { return }
      scrollArea.value.addEventListener('scroll', () => {
        if (!scrollArea.value) { return }
        scrollValue.value = scrollArea.value.scrollLeft
      })
    })

    return {
      allIds,
      duration,
      pixPerSec
    }
  },
  render () {
    return <div ref="scrollArea" class="tw-w-full tw-overflow-x-scroll tw-pb-2">
      <div class="tw-relative"
        style={{
          width: `${this.duration * this.pixPerSec}px`,
          height: '20px'
        }}
      >
        {this.allIds.map(idx => <Cue key={idx} idx={idx} />)}
      </div>
    </div>
  }
})
