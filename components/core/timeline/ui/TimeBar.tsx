import { usePixPerSec, useScrollValue, useDisplayWidth } from '../../provider/SubtitleControllerProvider'

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
  setup ({ timeBarHeight, fontSize }) {
    const nuxt = useNuxtApp()
    const canvas = useTemplateRef<HTMLCanvasElement>('canvas')
    const pixPerSec = usePixPerSec()
    const scrollValue = useScrollValue()

    const displayWidth = useDisplayWidth()
    const stepLevel = computed(() => {
      if (pixPerSec.value >= 10000) {
        return {
          format: 'HH:mm:ss.SSS',
          stepTime: 0.01
        }
      }
      if (pixPerSec.value >= 5000) {
        return {
          format: 'HH:mm:ss.SSS',
          stepTime: 0.05
        }
      }
      if (pixPerSec.value >= 1000) {
        return {
          format: 'HH:mm:ss.SSS',
          stepTime: 0.1
        }
      }
      if (pixPerSec.value >= 200) {
        return {
          format: 'HH:mm:ss.SSS',
          stepTime: 0.5
        }
      }
      if (pixPerSec.value >= 100) {
        return {
          format: 'HH:mm:ss',
          stepTime: 1
        }
      }
      if (pixPerSec.value >= 20) {
        return {
          format: 'HH:mm:ss',
          stepTime: 5
        }
      }
      return {
        format: 'HH:mm:ss',
        stepTime: 10
      }
    })

    watch([displayWidth, timeBarHeight, fontSize, scrollValue, pixPerSec], () => {
      requestAnimationFrame(() => {
        canvas.value?.setAttribute('width', canvas.value.offsetWidth.toString())
        drawTimeBar()
      })
    })
    onMounted(() => {
      requestAnimationFrame(() => {
        drawTimeBar()
      })
    })

    function drawTimeBar () {
      if (!canvas.value) { return }
      const context = canvas.value.getContext('2d')
      if (!context) { return }
      const canvasWidth = canvas.value.offsetWidth
      context.clearRect(0, 0, canvasWidth, timeBarHeight)
      context.font = `${fontSize}px 'Roboto', 'Noto', sans-serif`
      context.textAlign = 'left'
      context.textBaseline = 'bottom'

      let time = Math.floor(scrollValue.value / stepLevel.value.stepTime) * stepLevel.value.stepTime
      let position = (time - scrollValue.value) * pixPerSec.value

      while (position < canvasWidth) {
        drawTimeLabel(nuxt.$dayjs((time) * 1000)
          .utc()
          .format(stepLevel.value.format), position)
        time += stepLevel.value.stepTime
        position += stepLevel.value.stepTime * pixPerSec.value
      }
    }

    function drawTimeLabel (time: string, position: number) {
      const context = canvas.value?.getContext('2d')
      if (!context) { return }
      context.fillStyle = 'black'
      context.fillText(time, position + 3, (fontSize + timeBarHeight) / 2)
      context.strokeStyle = 'black'
      context.beginPath()
      context.moveTo(position, 0)
      context.lineTo(position, timeBarHeight)
      context.stroke()
    }
  },
  render () {
    return <canvas
      ref='canvas'
      class="tw-w-full"
      height={this.timeBarHeight}
    />
  }
})
