import type { WritableComputedRef } from 'vue'
import useFFmpeg from '~/components/core/wave/composables/useFFmpeg'
interface LevelData {
  displayTerm: number,
  /**
   * how many bars on a second.
   */
  barPerSec: number,
  /**
   * waveform bar size
   */
  barSize: number,
  /**
   * format for timeline display
   */
  format: 'HH:mm:ss.SSS' | 'HH:mm:ss',
  scaleValue: number
}

/**
 * Mixins for rendering audio waveform data.
 * @param file - Video file.
 * @param waveCanvas - Wave gauge display.
 * @param timelineCanvas - Timeline display.
 * @param lazyScroll - Scroll position.
 * @param displayLevel - Display level.
 * @param widthSize - Canvas's width size.
 * @param waveHeight - Wave height, will be two times this value (waveHeight * 2 = canvas height).
 * @param waveBySec - Number of waves per second used for rendering waveform.
 * Default is 480, calculated for compression.
 * If the output has a sample rate of 48000 Hz and 480 waves per second,
 * the waveform data length will be (48000 * 2) / 480 * duration (in seconds).
 */
export default function AudioWave (
  file: File | undefined,
  waveCanvas: ComputedRef<HTMLCanvasElement | null | undefined>,
  timelineCanvas: ComputedRef<HTMLCanvasElement | null | undefined>,
  lazyScroll: ComputedRef<number>,
  displayLevel: ComputedRef<number>,
  widthSize: ComputedRef<number>,
  duration: WritableComputedRef<number>,
  waveHeight: number,
  waveBySec: number = 480
) {
  const nuxt = useNuxtApp()
  /**
   * display level sampling data
   */
  const levelDatas = readonly<LevelData[]>([
    {
      displayTerm: 0.1,
      barPerSec: 64,
      barSize: 0.5,
      format: 'HH:mm:ss.SSS',
      scaleValue: 0.5
    },
    {
      displayTerm: 5,
      barPerSec: 8,
      barSize: 3,
      format: 'HH:mm:ss.SSS',
      scaleValue: 1
    },
    {
      displayTerm: 15,
      barPerSec: 4,
      barSize: 3,
      format: 'HH:mm:ss',
      scaleValue: 2
    },
    {
      displayTerm: 120,
      barPerSec: 1,
      barSize: 3,
      format: 'HH:mm:ss',
      scaleValue: 3
    },
    {
      displayTerm: 480,
      barPerSec: 0.2,
      barSize: 6,
      format: 'HH:mm:ss',
      scaleValue: 6
    }
  ])
  /**
   * choosen display level data
   */
  const levelData = computed(() => levelDatas[displayLevel.value])
  /**
   * how much waveform data in a second
   */
  const displayWaveBySec = computed(() => {
    return waveBySec / levelData.value.barPerSec
  })
  const displayBarSize = computed(() => {
    return Math.max(
      Math.ceil(
        ((levelData.value.barSize / displayWaveBySec.value) * 100) / levelData.value.scaleValue
      ),
      2
    )
  })
  const pixPerSec = computed(() => {
    return displayBarSize.value * levelData.value.barPerSec
  })
  const data = reactive<{
    waveformData: number[]
    cueGeneratedData: VTTCue[]
    dataByLevel: {[k: number]: number[]}
  }>({
    waveformData: [],
    cueGeneratedData: [],
    dataByLevel: {}
  })
  /**
   * Generates temporary waveform data based on the display level.
   * @returns waveform data
   */
  function dataByLevelDisplay () {
    if (data.dataByLevel[displayLevel.value]) { return data.dataByLevel[displayLevel.value] }
    const maxRound = Math.ceil(
      data.waveformData.length / displayWaveBySec.value
    )
    const buffer = []
    for (let i = 0; i < maxRound; i++) {
      const soundArea = data.waveformData.slice(
        i * displayWaveBySec.value,
        (i + 1) * displayWaveBySec.value
      )
      const { maxArea, minArea } = soundArea.reduce(
        (acc, cur, i) => {
          if (i % 2 === 0) {
            acc.maxArea = acc.maxArea < cur ? cur : acc.maxArea
          } else {
            acc.minArea = acc.minArea > cur ? cur : acc.minArea
          }
          return acc
        },
        { maxArea: 0, minArea: 0 }
      )
      buffer.push(maxArea, minArea)
    }
    data.dataByLevel[displayLevel.value] = buffer
    return data.dataByLevel[displayLevel.value]
  }

  function clearCanvas (canvas: HTMLCanvasElement, width: number, height: number) {
    canvas.getContext('2d')?.clearRect(0, 0, width, height)
  }
  /**
   * Clear waveform canvas.
   */
  function clearWave () {
    if (!waveCanvas.value) { return }
    clearCanvas(waveCanvas.value, widthSize.value, waveHeight * 2)
  }
  /**
   * Clear timeline canvas.
   */
  function clearTimeline () {
    if (!timelineCanvas.value) { return }
    clearCanvas(timelineCanvas.value, widthSize.value, 20)
  }
  /**
   * Draw waveform on wave Canvas
   * @param scroll scrolled position
   */
  function drawWave (canvas: HTMLCanvasElement | null | undefined, scroll: number) {
    if (!canvas) { return }
    const context = canvas.getContext('2d')
    if (!context) { return }
    const skipPos = Math.floor(scroll * levelData.value.barPerSec) * 2
    const visibleWidth = dataByLevelDisplay().slice(
      skipPos,
      skipPos + Math.round(widthSize.value / displayBarSize.value) * 2
    )
    context.fillStyle = canvas.computedStyleMap().get('--wave-line-bar-color') as string
    for (let pos = 0; pos < visibleWidth.length; pos += 2) {
      context.fillRect(
        (pos / 2) * displayBarSize.value,
        waveHeight - visibleWidth[pos],
        displayBarSize.value - 1,
        visibleWidth[pos] - visibleWidth[pos + 1]
      )
    }
  }
  /**
   * Generate time label on timeline Canvas
   * @param canvas Canvas
   * @param time time text
   * @param position position
   */
  function genTimeLabel (canvas: HTMLCanvasElement | null | undefined, time: string, position: number) {
    if (!canvas) { return }
    const context = canvas.getContext('2d')
    if (!context) { return }
    context.fillStyle = canvas.computedStyleMap().get('--time-line-font-color') as string
    context.fillText(time, position + 3, 12)
    // time mask
    context.strokeStyle = canvas.computedStyleMap().get('--time-line-mark-color') as string
    context.beginPath()
    context.moveTo(position, 0)
    context.lineTo(position, 20)
    context.stroke()
  }
  /**
   * Draw timeline on timeline Canvas
   * @param scroll scrolled position
   */
  function drawTimeline (canvas: HTMLCanvasElement, scroll: number) {
    const context = canvas.getContext('2d')
    if (!context) { return }
    context.font = "12px 'Roboto', 'Noto', sans-serif"
    context.textAlign = 'left'
    context.textBaseline = 'bottom'
    const displaySpace = levelData.value.displayTerm * pixPerSec.value
    const timeRound =
      Math.ceil(widthSize.value / levelData.value.displayTerm / pixPerSec.value) + 1
    const leftSpace = (scroll % levelData.value.displayTerm) * pixPerSec.value
    const leftRound =
      Math.floor(scroll / levelData.value.displayTerm) * levelData.value.displayTerm

    for (let i = 0; i < timeRound; i++) {
      genTimeLabel(
        canvas,
        nuxt.$dayjs((i * levelData.value.displayTerm + leftRound) * 1000)
          .utc()
          .format(levelData.value.format),
        Math.ceil(i * displaySpace - leftSpace)
      )
    }
  }
  /**
   * Generate Timeline and waveform
   */
  function genWave () {
    if (import.meta.env.SSR) { return }
    requestAnimationFrame(() => {
      if (!waveCanvas.value || !timelineCanvas.value) { return }
      if (
        Array.isArray(data.waveformData) && data.waveformData.length &&
        waveCanvas.value.width === widthSize.value
      ) {
        clearWave()
        drawWave(waveCanvas.value, lazyScroll.value)
      }
      clearTimeline()
      drawTimeline(timelineCanvas.value, lazyScroll.value)
    })
  }
  /**
   * Detect the new file, generate waveform data, and extract a WAV file.
   */

  const { convertWave, waveSerialize, whisperTranscribe } = useFFmpeg()

  watch(() => file, async (fileValue) => {
    if (!fileValue) { return }
    const { wave, maxMinValue, duration: convertedDuration } = await convertWave(fileValue)
    // take duration of file
    duration.value = convertedDuration
    data.waveformData = waveSerialize(wave, maxMinValue, waveHeight, pixPerSec.value)
    data.dataByLevel = {}
    // take Cues from Whisper
    const cueList = await whisperTranscribe(fileValue)
    if (cueList) {
      data.cueGeneratedData = cueList
    }
  })
  watch(() => [lazyScroll.value, widthSize.value, displayLevel.value, data.waveformData], (newVal, oldVal) => {
    if (newVal[0] !== oldVal[0] || newVal[1] !== oldVal[1] || newVal[2] !== oldVal[2] || newVal[3] !== oldVal[3]) {
      genWave()
    }
  })
  return {
    pixPerSec,
    levelDatasMax: computed(() => levelDatas.length),
    cueGeneratedData: computed(() => data.cueGeneratedData),
    loadFFmpeg: () => nuxt.$ffmpeg.load()
  }
}
