import useCueStore from '../composables/useCueStore'
import useCueControl from '../composables/useCueControl'

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
    const cue = getCue(idx)
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
      class="bg-gray-300/60"
      style={this.style}
    >
      <span
        v-memo={[this.cue.text]}
      >
        <pre>{this.cue?.text ?? ''}</pre>
      </span>
    </div>
  }
})
