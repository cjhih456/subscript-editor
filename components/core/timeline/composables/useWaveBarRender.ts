import type { ShallowRef } from 'vue'
import { useDisplayWidth, usePixPerSec, useScrollValue, useWaveData, useAudioRate, useWaveMinMaxValue } from '../../provider/SubtitleControllerProvider'

interface WaveBarRenderParams {
  canvasWidth: number
  waveHeight: number
  pixPerSec: number
  audioRate: number
  scrollTime: number
  waveData: number[]
  waveMinMaxValue: {
    min: number
    max: number
  }
}

export default function useWaveBarRender (
  canvas: Readonly<ShallowRef<HTMLCanvasElement | null>>,
  waveHeight: number
) {
  const pixPerSec = usePixPerSec()
  const audioRate = useAudioRate()
  const { time: scrollTime } = useScrollValue()
  const displayWidth = useDisplayWidth()
  const waveData = useWaveData()
  const waveMinMaxValue = useWaveMinMaxValue()

  const scaleValue = computed(() => Math.max(Math.abs(waveMinMaxValue.value.max), Math.abs(waveMinMaxValue.value.min)))

  let worker: Worker | null = null
  let offscreenCanvas: OffscreenCanvas | null = null

  function initWorker () {
    if (!canvas.value) { return }

    // OffscreenCanvas 생성
    offscreenCanvas = canvas.value.transferControlToOffscreen()

    // Worker 생성
    worker = new Worker(
      new URL('./useWaveBarRender.worker.ts', import.meta.url),
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

    const waveDataRaw = toRaw(waveData.value)
    const waveMinMaxValueRaw = toRaw(waveMinMaxValue.value)

    const params: WaveBarRenderParams = {
      canvasWidth,
      waveHeight,
      pixPerSec: pixPerSec.value,
      audioRate: audioRate.value,
      scrollTime: scrollTime.value,
      waveData: waveDataRaw,
      waveMinMaxValue: waveMinMaxValueRaw
    }

    worker.postMessage({
      type: 'render',
      params
    })
  }

  watch(() => [displayWidth.value, waveData.value, pixPerSec.value, scrollTime.value, waveHeight], () => {
    requestAnimationFrame(() => {
      if (canvas.value) {
        canvas.value.setAttribute('width', canvas.value.offsetWidth.toString())
        render()
      }
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
    render,
    scaleValue
  }
}
