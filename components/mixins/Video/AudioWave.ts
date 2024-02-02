import type { WritableComputedRef } from 'vue'
interface LevelData {
  displayTerm: number,
  barPerSec: number,
  barSize: number,
  /**
   * format for timeline display
   */
  format: 'HH:mm:ss.SSS' | 'HH:mm:ss',
  scaleValue: number
}

/**
 *
 * @param file video file
 * @param waveCanvas wave gage display
 * @param timelineCanvas timeline display
 * @param lazyScroll scroll position
 * @param displayLevel
 * @param widthSize canvas's width size
 * @param waveHeight wave Height will be two time of this value(waveHeight * 2 = canvas height)
 * @param waveBySec how many wave in a second (when make wave file need this value. will make a value for compress 48000 / waveBySec, default: 400)
 */
export default function AudioWave (
  file: ComputedRef<File|undefined>,
  waveCanvas: ComputedRef<HTMLCanvasElement | null | undefined>,
  timelineCanvas: ComputedRef<HTMLCanvasElement | null | undefined>,
  lazyScroll: ComputedRef<number>,
  displayLevel: ComputedRef<number>,
  widthSize: ComputedRef<number>,
  duration: WritableComputedRef<number>,
  waveHeight: number,
  waveBySec: number = 400
) {
  const nuxt = useNuxtApp()
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
  const levelData = computed(() => levelDatas[displayLevel.value])
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
    waveData: number[]
    cueGeneratedData: VTTCue[]
    dataByLevel: {[k: number]: number[]}
  }>({
    waveData: [],
    cueGeneratedData: [],
    dataByLevel: {}
  })

  function dataByLevelDisplay () {
    if (!data.dataByLevel[displayLevel.value]) {
      const maxRound = Math.ceil(
        data.waveData.length / displayWaveBySec.value
      )
      const buffer = []
      for (let i = 0; i < maxRound; i++) {
        const soundArea = data.waveData.slice(
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
    return data.dataByLevel[displayLevel.value]
  }
  function clearWave () {
    waveCanvas.value?.getContext('2d')?.clearRect(0, 0, widthSize.value, waveHeight * 2)
  }
  function clearTimeline () {
    timelineCanvas.value?.getContext('2d')?.clearRect(0, 0, widthSize.value, 20)
  }
  function drawWave (scroll: number) {
    const canvas = waveCanvas.value?.getContext('2d')
    if (canvas) {
      const skipPos = Math.floor(scroll * levelData.value.barPerSec) * 2
      const visibleWidth = dataByLevelDisplay().slice(
        skipPos,
        skipPos + Math.round(widthSize.value / displayBarSize.value) * 2
      )
      canvas.fillStyle = '#880000'
      for (let pos = 0; pos < visibleWidth.length; pos += 2) {
        canvas.fillRect(
          (pos / 2) * displayBarSize.value,
          waveHeight - visibleWidth[pos],
          displayBarSize.value - 1,
          visibleWidth[pos] - visibleWidth[pos + 1]
        )
      }
    }
  }
  function genTimeLabel (c: CanvasRenderingContext2D, t: string, x: number) {
    c.fillStyle = '#000'
    c.fillText(t, x + 3, 12)
    genTimeMark(c, x)
  }
  function genTimeMark (c: CanvasRenderingContext2D, x: number) {
    c.strokeStyle = '#880000'
    c.beginPath()
    c.moveTo(x, 0)
    c.lineTo(x, 20)
    c.stroke()
  }
  function drawTimeline (scroll: number) {
    const canvas = timelineCanvas.value?.getContext('2d')
    if (canvas) {
      canvas.font = "12px 'Roboto', 'Noto', sans-serif"
      canvas.textAlign = 'left'
      canvas.textBaseline = 'bottom'
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
  }
  function genWave () {
    if (
      !import.meta.env.SSR &&
      waveCanvas.value && timelineCanvas.value
    ) {
      requestAnimationFrame(() => {
        if (
          Array.isArray(data.waveData) && data.waveData.length &&
          waveCanvas.value?.width === widthSize.value
        ) {
          clearWave()
          drawWave(lazyScroll.value)
        }
        if (timelineCanvas.value) {
          clearTimeline()
          drawTimeline(lazyScroll.value)
        }
      })
    }
  }
  watch(() => file.value, (n) => {
    if (n) {
      n.arrayBuffer().then(async (v: ArrayBuffer) => {
        await nuxt.$ffmpeg.writeFile(new Uint8Array(v), 'video')
        await nuxt.$ffmpeg.transcodeWave('video', 'out.data', waveBySec).then((obj) => {
          data.waveData = obj.wave.map((v, idx) =>
            Math.round(
              (waveHeight * v) / Math.abs(obj.maxMinValue[idx % 2 ? 'min' : 'max'])
            )
          )
          genWave()
        })
        // take duration of file
        duration.value = await nuxt.$ffmpeg.takeMediaFileDuration()
        // take audio file for whisper
        const audioFile = await nuxt.$ffmpeg.transcodeAudio('video', 'out.wav')
        const file = new File([audioFile.buffer], 'out.wav', { type: 'audio/wav' })
        const formData = fetchData('post', {
          audio_file: file
        })
        useCustomFetch('http://localhost:3000/whisper/asr', {
          query: {
            encode: true,
            task: 'transcribe',
            word_timestamps: true,
            output: 'vtt'
          },
          cache: 'default',
          keepalive: false,
          duplex: 'half',
          body: formData,
          method: 'post'
        }).then(async (result: any) => {
          const cueList = await nuxt.$webVtt.parseSubtitle(result)
          if (cueList) {
            data.cueGeneratedData = cueList.cues
          }
        }).catch((e: Error) => {
          console.error(e)
        })
      })
    }
  })
  watch(() => [lazyScroll.value, widthSize.value, displayLevel.value], (newVal, oldVal) => {
    if (newVal[0] !== oldVal[0] || newVal[1] !== oldVal[1] || newVal[2] !== oldVal[2]) {
      genWave()
    }
  })
  onMounted(async () => {
    if (waveCanvas.value) {
      waveCanvas.value.height = waveHeight * 2
    }
    await nuxt.$ffmpeg.load()
  })
  return {
    pixPerSec,
    levelDatasMax: computed(() => levelDatas.length),
    cueGeneratedData: computed(() => data.cueGeneratedData)
  }
}
