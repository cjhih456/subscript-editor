export default function useFFmpeg () {
  const nuxt = useNuxtApp()

  async function loadFFmpeg () {
    await nuxt.$ffmpeg.load()
  }

  async function convertWave (file: File, outputAudioRate: number) {
    await loadFFmpeg()
    return nuxt.$ffmpeg.transcodeWave(file, outputAudioRate)
  }

  async function whisperTranscribe (file: File) {
    await loadFFmpeg()
    const audioFile = await nuxt.$ffmpeg.transcodeAudio(file, 'out.wav')
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
