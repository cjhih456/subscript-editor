import { Buffer } from 'buffer'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'
import type { WatchStopHandle } from 'vue'
export default defineNuxtPlugin(() => {
  const nuxt = useNuxtApp()
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
  /**
   * initialization ffmpeg wasm worker.
   */
  async function load () {
    if (data.loaded) {
      return Promise.resolve(true)
    }
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
    const baseURL = 'https://unpkg.com/@ffmpeg/core-mt@0.12.10/dist/esm'
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
  /**
   * Return the duration of the original file
   * Please use after transcode functions.
   * @returns duration
   */
  function takeMediaFileDuration () {
    const durationStr = messageRef.messages.slice(0).reverse().find(v => v.includes('Duration:'))
    if (durationStr) {
      const regex = /Duration: ([0-9:.]+),/g
      const result = regex.exec(durationStr)
      const time = (result && result[1]) || '00:00:00.00'
      return nuxt.$webVtt.convertTimeToSecond(time)
    }
    return 0
  }
  /**
   * Generate waveform data from the audio channel of the original file
   * @param inputFileName origin input file name
   * @param outputFileName s16le waveform data name
   * @returns waveform data & min, max object
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
  /**
   * Extract the audio stream from the video file to create a WAV file.
   * @param inputFileName saved origin file name
   * @param outputFileName output file name
   * @param options ffmpeg options for wav format file (bitrate, channel, etc)
   * @returns audio file data (Uint8Array)
   */
  async function transcodeAudio (inputFileName: string, outputFileName: string, options: any = {}) {
    const command = ['-i', inputFileName, '-ar', '16000']

    for (const [key, value] of Object.entries(options)) {
      command.push(key, String(value))
    }
    command.push(outputFileName)

    await ffmpegRef.value.exec(command)
    const data = await ffmpegRef.value.readFile(outputFileName, 'binary') as Uint8Array
    ffmpegRef.value.deleteFile(outputFileName)
    return new Uint8Array(data)
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
        transcodeAudio
      }
    }
  }
})
