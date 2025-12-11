import useTimeBarRender from '../composables/useTimeBarRender'

export default defineNuxtComponent({
  name: 'TimeBar',
  props: {
    timeBarHeight: {
      type: Number,
      default: 20
    },
    fontSize: {
      type: Number,
      default: 12
    }
  },
  setup (props) {
    const canvas = useTemplateRef<HTMLCanvasElement>('canvas')
    useTimeBarRender(canvas, props.timeBarHeight, props.fontSize)
  },
  render () {
    return <canvas
      ref='canvas'
      class="w-full"
      height={this.timeBarHeight}
    />
  }
})
