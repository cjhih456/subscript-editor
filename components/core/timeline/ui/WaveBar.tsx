import useWaveBarRender from '../composables/useWaveBarRender'

export default defineNuxtComponent({
  name: 'WaveBar',
  props: {
    waveHeight: {
      type: Number,
      default: 50
    }
  },
  setup ({ waveHeight }) {
    const canvas = useTemplateRef<HTMLCanvasElement>('canvas')
    useWaveBarRender(canvas, waveHeight)
  },
  render () {
    return <canvas
      ref='canvas'
      class="w-full"
      height={this.waveHeight}
    />
  }
})
