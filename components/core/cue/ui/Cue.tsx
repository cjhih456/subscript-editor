import { useCueStore, usePixPerSec } from '../../SubtitleInjecter'

export default defineNuxtComponent({
  name: 'Cue',
  props: {
    idx: {
      type: String,
      default: ''
    }
  },
  setup ({ idx }) {
    const { get: getCue } = useCueStore()
    const pixPerSec = usePixPerSec()
    const cue = getCue(idx)

    const startPosition = computed(() => {
      return pixPerSec.value * (cue?.startTime ?? 0)
    })
    const endPosition = computed(() => {
      return pixPerSec.value * (cue?.endTime ?? 0)
    })
    const width = computed(() => {
      return endPosition.value - startPosition.value
    })

    const style = computed(() => {
      return {
        width: width.value + 'px',
        left: startPosition.value + 'px'
      }
    })

    return {
      cue,
      style
    }
  },
  render () {
    return <div
      class="bg-gray-300/60"
      style={this.style}
      v-memo={[this.cue.text, this.cue.startTime, this.cue.endTime]}
    >
      <span>
        <pre>{this.cue?.text ?? ''}</pre>
      </span>
    </div>
  }
})
