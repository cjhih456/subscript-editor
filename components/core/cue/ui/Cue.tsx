import useCueControl from '~/components/core/cue/composables/useCueControl'
import { useCueStore } from '~/components/core/provider/SubtitleControllerProvider'

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
    const element = useTemplateRef<HTMLDivElement>('cue')
    const cue = computed(() => getCue(idx))
    const { cueDisplayPosition: displayPosition } = useCueControl(idx, element)

    const style = computed(() => {
      const { width, left } = displayPosition.value
      return {
        width: width + 'px',
        left: left + 'px'
      }
    })

    return {
      cue,
      style
    }
  },
  render () {
    return <div
      ref='cue'
      class="bg-gray-300/60 absolute h-full overflow-hidden border-gray-950 border"
      style={this.style}
    >
      <span class="pointer-events-none">
        <pre class="selection:bg-transparent pointer-events-none">{this.cue.text ?? ''}</pre>
      </span>
    </div>
  }
})
