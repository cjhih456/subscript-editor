import { useCueStore, useDuration, usePixPerSec } from '../../provider/SubtitleControllerProvider'
import Cue from './Cue'

export default defineNuxtComponent({
  name: 'CueBar',
  setup () {
    const { getAllIds } = useCueStore()
    const duration = useDuration()
    const pixPerSec = usePixPerSec()
    const cues = getAllIds()
    return {
      cues,
      duration,
      pixPerSec
    }
  },
  render () {
    return <div class="tw-w-full tw-overflow-x-scroll tw-pb-2">
      <div class="tw-relative"
        style={{
          width: `${this.duration * this.pixPerSec}px`,
          height: '20px'
        }}
      >
        {this.cues.map(idx => <Cue key={idx} idx={idx} />)}
      </div>
    </div>
  }
})
