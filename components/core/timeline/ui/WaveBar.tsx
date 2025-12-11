import useWaveBarRender from '../composables/useWaveBarRender'

export default defineNuxtComponent({
  name: 'WaveBar',
  props: {
    waveHeight: {
      type: Number,
      default: 50
    }
  },
  setup (props) {
    const canvas = useTemplateRef<HTMLCanvasElement>('canvas')
    useWaveBarRender(canvas, props.waveHeight)
  },
  render () {
    return <canvas
      ref='canvas'
      class="w-full"
      height={this.waveHeight}
    />
  }
})
