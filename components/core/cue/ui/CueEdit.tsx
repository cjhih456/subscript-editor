import useCueStore from '../composables/useCueStore'

export default defineNuxtComponent({
  name: 'CueEdit',
  props: {
    idx: {
      type: String,
      default: ''
    }
  },
  setup ({ idx }) {
    const { get: getCue } = useCueStore()
    const cue = getCue(idx)
    return { cue }
  },
  render () {
    return <div>
      {/* TODO: vue-shadcn/ui 적용시 수정 */}
      <h1>CueEdit</h1>
    </div>
  }
})
