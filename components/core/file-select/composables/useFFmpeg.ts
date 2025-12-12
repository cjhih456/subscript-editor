export default function useFFmpeg () {
  const nuxt = useNuxtApp()

  async function loadFFmpeg () {
    await nuxt.$ffmpeg.load()
  }

  async function convertWave (file: File, outputAudioRate: number) {
    await loadFFmpeg()
    const arrayBuffer = await file.arrayBuffer()
    await nuxt.$ffmpeg.writeFile(new Uint8Array(arrayBuffer), 'video')
    const emitter = nuxt.$ffmpeg.transcodeWave('video', 'out.data', outputAudioRate)
    await nuxt.$ffmpeg.clearFile('video')
    return emitter
  }

  async function whisperTranscribe (file: File) {
    await loadFFmpeg()
    const arrayBuffer = await file.arrayBuffer()
    await nuxt.$ffmpeg.writeFile(new Uint8Array(arrayBuffer), 'video')
    const audioFile = await nuxt.$ffmpeg.transcodeAudio('video', 'out.wav')
    await nuxt.$ffmpeg.clearFile('video')
    const wavFile = new File([audioFile], 'out.wav', { type: 'audio/wav' })
    const formData = fetchData('post', {
      audio_file: wavFile
    })
    return await useCustomFetch<string>('http://localhost:3000/whisper/asr', {
      query: {
        encode: false,
        task: 'transcribe',
        word_timestamps: true,
        output: 'vtt'
      },
      cache: 'default',
      keepalive: false,
      duplex: 'half',
      body: formData,
      method: 'post'
    }).then(async (result: string) => {
      const cueList = await nuxt.$webVtt.parseSubtitle(result)
      if (cueList) {
        return cueList.cues
      }
    }).catch(() => {
      nuxt.$alert.show('Whisper are not working now.')
    })
  }

  return {
    loadFFmpeg,
    convertWave,
    whisperTranscribe
  }
}
