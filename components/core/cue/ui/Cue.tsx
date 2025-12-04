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
      class="tw-bg-gray-300/60 tw-absolute tw-h-full tw-overflow-hidden tw-border-gray-950 tw-border-[1px]"
      style={this.style}
    >
      <span>
        <pre>{this.cue.text ?? ''}</pre>
      </span>
    </div>
  }
})
