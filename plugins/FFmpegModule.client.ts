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
      console.log(message)
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
  async function transcodeAudio (file: Uint8Array, inputFileName: string, outputFileName: string) {
    await ffmpegRef.value.writeFile(inputFileName, file)
    await ffmpegRef.value.exec(['-f', 'lavfi',
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
    return data
  }
  async function transcodeVideo (file: Uint8Array, inputFileName: string, outputFileName: string, options: any = {}) {
    await ffmpegRef.value.writeFile(inputFileName, file)
    const command = ['-i', inputFileName]

    for (const [key, value] of Object.entries(options)) {
      command.push(key, String(value))
    }

    await ffmpegRef.value.exec(command)
    const data = await ffmpegRef.value.readFile(outputFileName) as Uint8Array
    return data
  }
  return {
    provide: {
      ffmpeg: {
        load,
        transcodeAudio,
        transcodeVideo
      }
    }
  }
})
