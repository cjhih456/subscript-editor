export interface TimeBarRenderParams {
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

interface WorkerMessage {
  type: 'render' | 'init'
  canvas?: OffscreenCanvas
  params?: TimeBarRenderParams
}

let ctx: OffscreenCanvasRenderingContext2D | null = null

// dayjs 포맷 함수를 시뮬레이션 (worker에서는 dayjs를 직접 사용할 수 없으므로)
function formatTime (time: number, format: string): string {
  const totalSeconds = Math.floor(time)
  const milliseconds = Math.floor((time - totalSeconds) * 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const pad = (n: number, digits: number = 2) => n.toString().padStart(digits, '0')

  if (format === 'HH:mm:ss.SSS') {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(milliseconds, 3)}`
  } else if (format === 'HH:mm:ss') {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  }
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

function drawTimeLabel (time: string, position: number, timeBarHeight: number, fontSize: number) {
  if (!ctx) { return }
  ctx.fillStyle = 'black'
  ctx.fillText(time, position + 3, (fontSize + timeBarHeight) / 2)
  ctx.strokeStyle = 'black'
  ctx.beginPath()
  ctx.moveTo(position, 0)
  ctx.lineTo(position, timeBarHeight)
  ctx.stroke()
}

function renderTimeBar (params: TimeBarRenderParams) {
  if (!ctx) { return }

  const { canvasWidth, timeBarHeight, fontSize, pixPerSec, scrollTime, stepLevel } = params
  ctx.canvas.width = canvasWidth
  ctx.canvas.height = timeBarHeight
  ctx.clearRect(0, 0, canvasWidth, timeBarHeight)
  ctx.font = `${fontSize}px 'Roboto', 'Noto', sans-serif`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'bottom'

  let time = Math.floor(scrollTime / stepLevel.stepTime) * stepLevel.stepTime
  let position = (time - scrollTime) * pixPerSec

  while (position < canvasWidth) {
    const timeString = formatTime(time, stepLevel.format)
    drawTimeLabel(timeString, position, timeBarHeight, fontSize)
    time += stepLevel.stepTime
    position += stepLevel.stepTime * pixPerSec
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
      renderTimeBar(params)
      self.postMessage({ type: 'rendered' })
    }
  }
}
