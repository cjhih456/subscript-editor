import { useCueStore, useDuration, usePixPerSec } from '../../provider/SubtitleControllerProvider'
import Cue from './Cue'

export default defineNuxtComponent({
  name: 'CueBar',
  setup () {
    const { allIds } = useCueStore()
    const duration = useDuration()
    const pixPerSec = usePixPerSec()

    return {
      allIds,
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
        {this.allIds.map(idx => <Cue key={idx} idx={idx} />)}
      </div>
  }
})
