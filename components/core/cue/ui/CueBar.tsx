import { useCueStore, useDuration, usePixPerSec, useScrollValue } from '../../provider/SubtitleControllerProvider'
import Cue from './Cue'

export default defineNuxtComponent({
  name: 'CueBar',
  setup () {
    const { store } = useCueStore()
    const duration = useDuration()
    const pixPerSec = usePixPerSec()
    const { value: scrollValue, width: scrollWidth } = useScrollValue()

    const lazyIdxList = computed(() => {

      const start = scrollValue.value / pixPerSec.value
      const end = (scrollValue.value + scrollWidth.value) / pixPerSec.value
      return Array.from(store.value.entries()).reduce((acc, [idx, cue]) => {
        if (
          cue.endTime >= start && cue.startTime <= end
        ) {
          acc.push(idx)
        }
        return acc
      }, [] as string[])
    })

    return {
      lazyIdxList,
      duration,
      pixPerSec
    }
  },
  render () {
    return <div class="relative"
        style={{
          width: `${this.duration * this.pixPerSec}px`,
          height: '20px'
        }}
      >
        {this.lazyIdxList.map(idx => <Cue key={idx} idx={idx} />)}
      </div>
  }
})
