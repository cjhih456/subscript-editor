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

interface WorkerMessage {
  type: 'render' | 'init'
  canvas?: OffscreenCanvas
  params?: WaveBarRenderParams
}

let ctx: OffscreenCanvasRenderingContext2D | null = null

function renderWaveBar (params: WaveBarRenderParams) {
  if (!ctx) { return }

  const { canvasWidth, waveHeight, pixPerSec, audioRate, scrollTime, waveData, waveMinMaxValue } = params

  const scaleValue = Math.max(Math.abs(waveMinMaxValue.max), Math.abs(waveMinMaxValue.min))
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

    if (start >= waveData.length) {
      break
    }

    let max = -127
    let min = 128
    for (let j = start; j < end; j++) {
      if (j >= 0 && j < waveData.length) {
        if (waveData[j] > max) { max = waveData[j] }
        if (waveData[j] < min) { min = waveData[j] }
      }
    }
    ctx.fillRect(i * 2, waveHalfHeight - (max / scaleValue) * waveHeight, 2, ((max - min) / scaleValue) * waveHeight)
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
