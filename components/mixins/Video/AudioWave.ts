// import dayjs from 'dayjs'
export default function audioWave (
  file: ComputedRef<File|undefined>,
  waveCanvas: ComputedRef<HTMLCanvasElement | null | undefined>,
  timelineCanvas: ComputedRef<HTMLCanvasElement | null | undefined>,
  lazyScroll: Ref<number>,
  displayLevel: Ref<number>,
  widthSize: ComputedRef<number>,
  waveHeight: number,
  waveBySec: number = 400
) {
  const nuxt = useNuxtApp()
  const levelDatas = readonly([
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
  const displayLevelCalc = computed(() => {
    return levelData.value.scaleValue
  })
  const barSize = computed(() => {
    return levelData.value.barSize
  })
  const barPerSec = computed(() => {
    return levelData.value.barPerSec
  })
  const displayTerm = computed(() => {
    return levelData.value.displayTerm
  })
  const displayLevelFormat = computed(() => {
    return levelData.value.format
  })
  const displayBarSize = computed(() => {
    return Math.max(
      Math.ceil(
        ((barSize.value / displayWaveBySec.value) * 100) / displayLevelCalc.value
      ),
      2
    )
  })
  const pixPerSec = computed(() => {
    return displayBarSize.value * barPerSec.value
  })
  const data = reactive<{
    waveData: number[]
    dataByLevel: {[k: number]: number[]}
  }>({
    waveData: [],
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
      const skipPos = Math.floor(scroll * barPerSec.value) * 2
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
      const displaySpace = displayTerm.value * pixPerSec.value
      const timeRound =
        Math.ceil(widthSize.value / displayTerm.value / pixPerSec.value) + 1
      const leftSpace = (scroll % displayTerm.value) * pixPerSec.value
      const leftRound =
        Math.floor(scroll / displayTerm.value) * displayTerm.value

      for (let i = 0; i < timeRound; i++) {
        genTimeLabel(
          canvas,
          nuxt.$dayjs((i * displayTerm.value + leftRound) * 1000)
            .utc()
            .format(displayLevelFormat.value),
          Math.ceil(i * displaySpace - leftSpace)
        )
      }
    }
  }
  function genWave () {
    if (
      !import.meta.env.SSR &&
      Array.isArray(data.waveData) && data.waveData.length &&
      waveCanvas.value && timelineCanvas.value
    ) {
      requestAnimationFrame(() => {
        if (waveCanvas.value?.width === widthSize.value) {
          clearWave()
          clearTimeline()
          drawWave(lazyScroll.value)
          drawTimeline(lazyScroll.value)
        }
      })
    }
  }
  watch(() => file.value, (n) => {
    if (n) {
      n.arrayBuffer().then(async (v: ArrayBuffer) => {
        const { Buffer } = await import('buffer')
        nuxt.$ffmpeg.transcodeAudio(new Uint8Array(v), 'video', 'out.data').then((wave: Uint8Array) => {
          const tempData = [] as number[]
          wave.reduce((acc, byte, i) => {
            if (i % 2 === 1) {
              acc.tempValue = Buffer.from([byte, acc.tempValue]).readInt16LE()
              if (acc.tempValue < acc.min) { acc.min = acc.tempValue }
              if (acc.tempValue > acc.max) { acc.max = acc.tempValue }
              if (++acc.readRound === 240) {
                tempData.push(acc.max, acc.min)
                acc.readRound = 0
                acc.min = 32767
                acc.max = -32768
              }
            } else {
              acc.tempValue = byte
            }
            return acc
          }, {
            tempValue: 0,
            readRound: 0,
            min: 32767,
            max: -32768
          })
          const maxValue = tempData.reduce(
            (acc, cur, idx) => {
              if (idx % 2) {
                acc.min = acc.min > cur ? cur : acc.min
              } else {
                acc.max = acc.max < cur ? cur : acc.max
              }
              return acc
            },
            { max: 0, min: 0 }
          )
          data.waveData = Array.from(tempData.map((v, idx) =>
            Math.round(
              (waveHeight * v) / Math.abs(maxValue[idx % 2 ? 'min' : 'max'])
            )
          ))
          genWave()
        })
      })
    }
  })
  onMounted(async () => {
    if (waveCanvas.value) {
      waveCanvas.value.height = waveHeight * 2
    }
    await nuxt.$ffmpeg.load()
  })
}
