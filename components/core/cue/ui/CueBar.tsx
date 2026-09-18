import { useCueStore, useDuration, usePixPerSec } from '../../provider/SubtitleControllerProvider'
import Cue from './Cue'

export default defineNuxtComponent({
  name: 'CueBar',
  setup () {
    const { allIds, get: getCue } = useCueStore()
    const duration = useDuration()
    const pixPerSec = usePixPerSec()

    const topIds = computed(() => allIds.value.filter(id => getCue(id).linePosition === 'top'))
    const bottomIds = computed(() => allIds.value.filter(id => getCue(id).linePosition !== 'top'))

    return {
      topIds,
      bottomIds,
      duration,
      pixPerSec
    }
  },
  render () {
    const width = `${this.duration * this.pixPerSec}px`
    return <div class="relative h-full" style={{ width }}>
      <div class="absolute inset-x-0 top-2 h-11">
        {this.topIds.map(idx => <Cue key={idx} idx={idx} />)}
      </div>
      <div class="absolute inset-x-0 bottom-2 h-11">
        {this.bottomIds.map(idx => <Cue key={idx} idx={idx} />)}
      </div>
    </div>
  }
})
