import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'
import EventEmitter from 'eventemitter3'
import type { WatchStopHandle } from 'vue'
export default defineNuxtPlugin(() => {
  const nuxt = useNuxtApp()
  const data = reactive({
    loaded: false,
    onLoading: false
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
          if (n) { return resolve(true) }
        }, { immediate: true, deep: false })
      }).finally(() => {
        if (watcher) { watcher() }
      })
    }
    setLoading(true)
    const baseURL = 'https://unpkg.com/@ffmpeg/core-mt@0.12.10/dist/esm'
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
  function takeMediaFileDuration (message: string) {
    if (!message.includes('Duration:')) return -1
    const regex = /Duration: ([0-9:.]+),/g
    const result = regex.exec(message)
    const time = (result && result[1]) || '00:00:00.00'
    return nuxt.$webVtt.convertTimeToSecond(time)
  }

  function progressCheck (message: string) {
    if (!message.includes('time=')) return -1
    const regex = /time=([0-9:.]+)/g
    const result = regex.exec(message)
    const time = (result && result[1]) || '00:00:00.00'
    return nuxt.$webVtt.convertTimeToSecond(time)
  }

  /**
   * Generate waveform data from the audio channel of the original file
   * @param inputFileName origin input file name
   * @param outputFileName s16le waveform data name
   * @param outputAudioRate output audio rate (Hz)
   * @returns waveform data & scale value
   */
  function transcodeWave (inputFileName: string, outputFileName: string, outputAudioRate: number) {
    const eventEmitter = new EventEmitter()
    const convertMessage = ({ message }: { message: string }) => {
      const duration = takeMediaFileDuration(message)
      if (duration !== -1) {
        eventEmitter.emit('duration', duration)
      }
      const progress = progressCheck(message)
      if (progress !== -1) {
        eventEmitter.emit('progress', progress)
      }
    }
    ffmpegRef.value.on('log', convertMessage)
    ffmpegRef.value.exec([
      '-v', 'info',
      '-f', 'lavfi',
      '-i', 'anullsrc=channel_layout=stereo:sample_rate=48000:duration=8.86',
      '-i', inputFileName,
      '-filter_complex', 'amix',
      '-f', 's8',
      '-ac', '1',
      '-acodec', 'pcm_s8',
      '-ar', String(outputAudioRate),
      outputFileName
    ]).then(() => {
      return ffmpegRef.value.readFile(outputFileName) as Promise<Uint8Array>
    }).then((data) => {
      ffmpegRef.value.off('log', convertMessage)
      ffmpegRef.value.deleteFile(outputFileName)

      // SharedArrayBuffer 생성
      const int8Data = Int8Array.from(data)
      const sharedBuffer = new SharedArrayBuffer(int8Data.length)
      const sharedArray = new Int8Array(sharedBuffer)
      sharedArray.set(int8Data)

      eventEmitter.emit('done', {
        wave: sharedBuffer,
        scaleValue: 128
      })
    })
    return eventEmitter
  }
  /**
   * Extract the audio stream from the video file to create a WAV file.
   * @param inputFileName saved origin file name
   * @param outputFileName output file name
   * @param options ffmpeg options for wav format file (bitrate, channel, etc)
   * @returns audio file data (Uint8Array)
   */
  async function transcodeAudio (inputFileName: string, outputFileName: string, options: Record<string, number | string> = {}) {
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
  function clearFile (inputFileName: string) {
    ffmpegRef.value.deleteFile(inputFileName)
  }
  return {
    provide: {
      ffmpeg: {
        load,
        writeFile,
        clearFile,
        transcodeWave,
        transcodeAudio
      }
    }
  }
})
