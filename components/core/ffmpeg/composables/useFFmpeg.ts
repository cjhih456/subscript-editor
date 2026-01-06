export default function useFFmpeg () {
  const nuxt = useNuxtApp()

  async function loadFFmpeg () {
    await nuxt.$ffmpeg.load()
  }

  async function convertWave (file: File, outputAudioRate: number) {
    await loadFFmpeg()
    return nuxt.$ffmpeg.transcodeWave(file, outputAudioRate)
  }

  async function convertAsAudio (file: File) {
    await loadFFmpeg()
    const audioFile = await nuxt.$ffmpeg.transcodeAudio(file, 'out.wav')
    const wavFile = new File([audioFile], 'out.wav', { type: 'audio/wav' })
    return wavFile
  }

  return {
    loadFFmpeg,
    convertWave,
    convertAsAudio
  }
}
