export interface WaveBarRenderParams {
  canvasWidth: number
  waveHeight: number
  pixPerSec: number
  audioRate: number
  scrollTime: number
  waveData: SharedArrayBuffer | null
  waveDataLength: number
  waveScaleValue: number
  waveColor: string
}

interface WorkerMessage {
  type: 'render' | 'init'
  canvas?: OffscreenCanvas
  params?: WaveBarRenderParams
}

let ctx: OffscreenCanvasRenderingContext2D | null = null

function renderWaveBar (params: WaveBarRenderParams) {
  if (!ctx || !params.waveData) { return }

  const { canvasWidth, waveHeight, pixPerSec, audioRate, scrollTime, waveData, waveDataLength, waveScaleValue, waveColor } = params

  // SharedArrayBuffer를 Int8Array로 래핑
  const waveDataArray = new Int8Array(waveData)

  const samplePerPixel = audioRate / pixPerSec
  const waveHalfHeight = waveHeight / 2

  ctx.canvas.width = canvasWidth
  ctx.canvas.height = waveHeight
  ctx.fillStyle = waveColor
  ctx.clearRect(0, 0, canvasWidth, waveHeight)
  ctx.beginPath()

  // timeAt(x) = scrollTime + x / pixPerSec → sampleIndex = timeAt(x) * audioRate
  const scrollOffset = scrollTime * audioRate

  for (let i = 0; i < canvasWidth; i += 2) {
    const start = Math.floor(i * samplePerPixel + scrollOffset)
    const end = Math.floor((i + 2) * samplePerPixel + scrollOffset)

    if (start >= waveDataLength) {
      break
    }

    let max = -127
    let min = 128
    for (let j = start; j < end; j++) {
      if (j >= 0 && j < waveDataLength) {
        const value = waveDataArray[j]
        if (value === undefined) { break }
        if (value > max) { max = value }
        if (value < min) { min = value }
      }
    }
    ctx.fillRect(i, waveHalfHeight - (max / waveScaleValue) * waveHeight, 2, ((max - min) / waveScaleValue) * waveHeight)
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
