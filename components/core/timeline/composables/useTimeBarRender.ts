import type { ShallowRef } from 'vue'
import { usePixPerSec, useScrollValue, useDisplayWidth } from '../../provider/SubtitleControllerProvider'

interface TimeBarRenderParams {
  canvasWidth: number
  timeBarHeight: number
  fontSize: number
  pixPerSec: number
  scrollTime: number
  stepLevel: {
    format: string
    stepTime: number
  }
}

export default function useTimeBarRender (
  canvas: Readonly<ShallowRef<HTMLCanvasElement | null>>,
  timeBarHeight: number,
  fontSize: number
) {
  const pixPerSec = usePixPerSec()
  const { time: scrollTime } = useScrollValue()
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
    if (pixPerSec.value >= 10) {
      return {
        format: 'HH:mm:ss',
        stepTime: 10
      }
    }
    return {
      format: 'HH:mm:ss',
      stepTime: 20
    }
  })

  let worker: Worker | null = null
  let offscreenCanvas: OffscreenCanvas | null = null

  function initWorker () {
    if (!canvas.value) { return }

    // OffscreenCanvas 생성
    offscreenCanvas = canvas.value.transferControlToOffscreen()

    // Worker 생성
    worker = new Worker(
      new URL('./useTimeBarRender.worker.ts', import.meta.url),
      { type: 'module' }
    )

    // Worker에 OffscreenCanvas 전송
    worker.postMessage(
      {
        type: 'init',
        canvas: offscreenCanvas
      },
      [offscreenCanvas]
    )

    // Worker로부터 메시지 수신 처리
    worker.onmessage = (e) => {
      if (e.data.type === 'rendered') {
        // 렌더링 완료 처리 (필요시)
      }
    }
  }

  function render () {
    if (!canvas.value || !worker) { return }

    const canvasWidth = canvas.value.offsetWidth
    canvas.value.setAttribute('width', canvasWidth.toString())

    const params: TimeBarRenderParams = {
      canvasWidth,
      timeBarHeight,
      fontSize,
      pixPerSec: pixPerSec.value,
      scrollTime: scrollTime.value,
      stepLevel: stepLevel.value
    }

    worker.postMessage({
      type: 'render',
      params
    })
  }

  watch(() => [displayWidth.value, scrollTime.value, pixPerSec.value, timeBarHeight, fontSize], () => {
    requestAnimationFrame(() => {
      render()
    })
  })

  onMounted(() => {
    requestAnimationFrame(() => {
      initWorker()
      render()
    })
  })

  onBeforeUnmount(() => {
    if (worker) {
      worker.terminate()
      worker = null
    }
    offscreenCanvas = null
  })

  return {
    render
  }
}
