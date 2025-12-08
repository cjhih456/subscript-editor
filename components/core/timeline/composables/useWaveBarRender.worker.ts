export interface WaveBarRenderParams {
  canvasWidth: number
  waveHeight: number
  pixPerSec: number
  audioRate: number
  scrollTime: number
  waveData: SharedArrayBuffer | null
  waveDataLength: number
  waveScaleValue: number
}

interface WorkerMessage {
  type: 'render' | 'init'
  canvas?: OffscreenCanvas
  params?: WaveBarRenderParams
}

let ctx: OffscreenCanvasRenderingContext2D | null = null

function renderWaveBar (params: WaveBarRenderParams) {
  if (!ctx || !params.waveData) { return }

  const { canvasWidth, waveHeight, pixPerSec, audioRate, scrollTime, waveData, waveDataLength, waveScaleValue } = params

  // SharedArrayBuffer를 Int8Array로 래핑
  const waveDataArray = new Int8Array(waveData)

  const samplePerPixel = (audioRate / pixPerSec) * 2
  const waveHalfHeight = waveHeight / 2

  ctx.canvas.width = canvasWidth
  ctx.canvas.height = waveHeight
  ctx.fillStyle = 'black'
  ctx.clearRect(0, 0, canvasWidth, waveHeight)
  ctx.beginPath()

  // scrollValue를 고려하여 파형 데이터의 시작 위치 계산
  const scrollOffset = Math.floor(scrollTime * audioRate)

  for (let i = 0; i < canvasWidth; i += 2) {
    // scrollValue에 따른 오프셋 적용
    const start = Math.floor(i * samplePerPixel) + scrollOffset
    const end = start + samplePerPixel * 2

    if (start >= waveDataLength) {
      break
    }

    let max = -127
    let min = 128
    for (let j = start; j < end; j++) {
      if (j >= 0 && j < waveDataLength) {
        const value = waveDataArray[j]
        if (value > max) { max = value }
        if (value < min) { min = value }
      }
    }
    ctx.fillRect(i * 2, waveHalfHeight - (max / waveScaleValue) * waveHeight, 2, ((max - min) / waveScaleValue) * waveHeight)
  }
}

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const { type, canvas, params } = e.data

  if (type === 'init' && canvas) {
    ctx = canvas.getContext('2d')
    if (ctx) {
      self.postMessage({ type: 'ready' })
    }
  } else if (type === 'render' && params) {
    if (ctx) {
      renderWaveBar(params)
      self.postMessage({ type: 'rendered' })
    }
  }
}
