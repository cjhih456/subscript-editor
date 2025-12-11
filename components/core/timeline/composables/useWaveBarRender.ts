import type { ShallowRef } from 'vue'
import { useDisplayWidth, usePixPerSec, useScrollValue, useWaveData, useAudioRate, useWaveScaleValue } from '../../provider/SubtitleControllerProvider'
import WaveBarRenderWorker from './useWaveBarRender.worker?worker&inline'
import type { WaveBarRenderParams } from './useWaveBarRender.worker'

export default function useWaveBarRender (
  canvas: Readonly<ShallowRef<HTMLCanvasElement | null>>,
  waveHeight: number
) {
  const pixPerSec = usePixPerSec()
  const audioRate = useAudioRate()
  const { time: scrollTime } = useScrollValue()
  const displayWidth = useDisplayWidth()
  const waveData = useWaveData()
  const waveScaleValue = useWaveScaleValue()

  let worker: Worker | null = null
  let offscreenCanvas: OffscreenCanvas | null = null

  function initWorker () {
    if (!canvas.value) { return }

    // OffscreenCanvas 생성
    offscreenCanvas = canvas.value.transferControlToOffscreen()

    // Worker 생성
    worker = new WaveBarRenderWorker()

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
    const waveColor = canvas.value.computedStyleMap().get('color')?.toString() || 'black'
    const waveDataRaw = toRaw(waveData.value)

    if (!waveDataRaw) { return }

    const params: WaveBarRenderParams = {
      canvasWidth,
      waveHeight,
      pixPerSec: pixPerSec.value,
      audioRate: audioRate.value,
      scrollTime: scrollTime.value,
      waveData: waveDataRaw,
      waveDataLength: waveDataRaw.byteLength,
      waveScaleValue: waveScaleValue.value,
      waveColor: waveColor
    }

    worker.postMessage({
      type: 'render',
      params
    })
  }

  watch(() => [displayWidth.value, waveData.value, pixPerSec.value, scrollTime.value, waveHeight], () => {
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
