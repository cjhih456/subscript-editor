import { useDisplayWidth, usePixPerSec, useScrollValue, useWaveData, useAudioRate, useWaveMinMaxValue } from '~/components/core/provider/SubtitleControllerProvider'

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
    const pixPerSec = usePixPerSec()
    const audioRate = useAudioRate()
    const scrollValue = useScrollValue()
    const displayWidth = useDisplayWidth()
    const waveData = useWaveData()
    const waveMinMaxValue = useWaveMinMaxValue()

    const scaleValue = computed(() => Math.max(Math.abs(waveMinMaxValue.value.max), Math.abs(waveMinMaxValue.value.min)))
    const samplePerPixel = computed(() => (audioRate.value / pixPerSec.value) * 2)

    const waveHalfHeight = computed(() => waveHeight / 2)

    watch([displayWidth, waveData, pixPerSec, scrollValue, waveHeight], () => {
      requestAnimationFrame(() => {
        drawWave()
      })
    })
    onMounted(() => {
      requestAnimationFrame(() => {
        drawWave()
      })
    })

    function drawWave () {
      if (!canvas.value) { return }
      const context = canvas.value.getContext('2d')
      if (!context) { return }
      context.fillStyle = 'black'
      const canvasWidth = canvas.value.offsetWidth
      context.clearRect(0, 0, canvasWidth, waveHeight)
      context.beginPath()

      for (let i = 0; i < canvasWidth; i += 2) {
        const start = Math.floor(i * samplePerPixel.value)
        const end = start + samplePerPixel.value * 2

        if (start >= waveData.value.length) {
          break
        }

        let max = -127
        let min = 128
        for (let j = start; j < end; j++) {
          if (waveData.value[j] > max) { max = waveData.value[j] }
          if (waveData.value[j] < min) { min = waveData.value[j] }
        }
        context.fillRect(i * 2, waveHalfHeight.value - (max / scaleValue.value) * waveHeight, 2, ((max - min) / scaleValue.value) * waveHeight)
      }
    }
    return {
      scaleValue
    }
  },
  render () {
    return <canvas
      ref='canvas'
      class="tw-w-full"
      height={this.waveHeight}
      width={(this.$refs.canvas as HTMLCanvasElement)?.offsetWidth || 0}
    />
  }
})
