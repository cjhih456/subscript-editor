import { Buffer } from 'buffer'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'
import type { WatchStopHandle } from 'vue'
export default defineNuxtPlugin(() => {
  const data = reactive({
    loaded: false,
    onLoading: false
  })
  const messageRef = reactive({
    messages: [] as string[]
  })
  const ffmpegRef = shallowRef(new FFmpeg())
  function setLoaded (v: boolean) {
    data.loaded = v
  }
  function setLoading (v: boolean) {
    data.onLoading = v
  }
  async function load () {
    if (data.onLoading) {
      let watcher: WatchStopHandle
      return new Promise((resolve) => {
        watcher = watch(() => data.loaded, (n) => {
          n && resolve(true)
        }, { immediate: true, deep: false })
      }).finally(() => {
        watcher && watcher()
      })
    }
    setLoading(true)
    const baseURL = 'https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm'
    ffmpegRef.value.on('log', ({ message }) => {
      messageRef.messages.push(message)
    })
    // toBlobURL is used to bypass CORS issue, urls with the same
    // domain can be used directly.
    const result = await ffmpegRef.value.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript')
    })
    setLoaded(result)
  }

  function takeMediaFileDuration () {
    const durationStr = messageRef.messages.slice(0).reverse().find(v => v.includes('Duration:'))
    if (durationStr) {
      const regex = /Duration: ([0-9:.]+),/g
      const result = regex.exec(durationStr)
      const time = (result && result[1]) || '00:00:00.00'
      const [hour, min, sec, ms] = time.split(/[:.]/g).map(v => +v)
      return ((hour * 3600 + min * 60 + sec) * 1000 + ms * 10) / 1000
    }
    return 0
  }
  /**
   * make wave data from file's audio channel
   * @param file VideoFile
   * @param inputFileName VideoFileName
   * @param outputFileName OutputFileName
   * @returns wave data & min, max value object
   */
  async function transcodeWave (inputFileName: string, outputFileName: string, waveBySec: number) {
    await ffmpegRef.value.exec([
      '-v', 'info',
      '-f', 'lavfi',
      '-i', 'anullsrc=channel_layout=stereo:sample_rate=48000:duration=8.86',
      '-i', inputFileName,
      '-filter_complex', 'amix',
      '-f', 's16le',
      '-ac', '1',
      '-acodec', 'pcm_s16le',
      '-ar', '48000',
      outputFileName
    ])
    const data = await ffmpegRef.value.readFile(outputFileName) as Uint8Array
    ffmpegRef.value.deleteFile(outputFileName)
    const wave = [] as number[]
    const maxMinValue = {
      max: -32768,
      min: 32767
    }
    const waveBySecValue = 96000 / waveBySec // (48000 * 2) / waveBySec
    data.reduce((acc, byte, i) => {
      if (i % 2 === 1) {
        const value = Buffer.from([acc.tempValue, byte]).readInt16LE()
        if (value < maxMinValue.min) { maxMinValue.min = value }
        if (value < acc.min) { acc.min = value }
        if (value > maxMinValue.max) { maxMinValue.max = value }
        if (value > acc.max) { acc.max = value }
        if (++acc.readRound === waveBySecValue) {
          wave.push(acc.max, acc.min)
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
    return {
      wave,
      maxMinValue
    }
  }
  async function transcodeVideo (inputFileName: string, outputFileName: string, options: any = {}) {
    const command = ['-i', inputFileName]

    for (const [key, value] of Object.entries(options)) {
      command.push(key, String(value))
    }
    command.push(outputFileName)
    await ffmpegRef.value.exec(command)
    const data = await ffmpegRef.value.readFile(outputFileName) as Uint8Array
    return data
  }
  async function transcodeAudio (inputFileName: string, outputFileName: string, options: any = {}) {
    const command = ['-i', inputFileName, '-ar', '16000']

    for (const [key, value] of Object.entries(options)) {
      command.push(key, String(value))
    }
    command.push(outputFileName)

    await ffmpegRef.value.exec(command)
    const data = await ffmpegRef.value.readFile(outputFileName) as Uint8Array
    ffmpegRef.value.deleteFile(outputFileName)
    return data
  }
  async function writeFile (file: Uint8Array, inputFileName: string) {
    await ffmpegRef.value.writeFile(inputFileName, file)
  }
  return {
    provide: {
      ffmpeg: {
        load,
        writeFile,
        takeMediaFileDuration,
        transcodeWave,
        transcodeAudio,
        transcodeVideo
      }
    }
  }
})
