import { useAudioRate, useConvertProgress, useCueStore, useDuration, useVideoFile, useVideoFileObjectUrl, useWaveData, useWaveScaleValue } from "../../provider/SubtitleControllerProvider"
import { useWhisperProvider } from "../../whisper"
import useFFmpeg from "./useFFmpeg"
import type EventEmitter from "eventemitter3"

export default function useWaveConverter () {
  const nuxt = useNuxtApp()
  const { clearVideoFileObjectUrl, setVideoFileObjectUrl } = useVideoFileObjectUrl()
  const file = useVideoFile()
  const duration = useDuration()
  const audioRate = useAudioRate()
  const waveScaleValue = useWaveScaleValue()
  const waveData = useWaveData()
  const convertProgress = useConvertProgress()
  const emitter = ref<EventEmitter | null>(null)
  const { loadFFmpeg, convertWave, convertAsAudio } = useFFmpeg()

  const { willUseWhisper, transcribe, selectedLanguage } = useWhisperProvider()
  const { loadCues } = useCueStore()

  watch(() => file.value, async (newFile) => {
    if (!newFile) { return }
    await loadFFmpeg()
    emitter.value = await convertWave(newFile, audioRate.value)
    clearVideoFileObjectUrl()
    setVideoFileObjectUrl(newFile)
    emitter.value.on('duration', (d: number) => {
      duration.value = d
    })
    emitter.value.on('progress', (progress: number) => {
      if (duration.value === 0) { return }
      convertProgress.value = Math.round((progress / duration.value) * 100)
    })
    emitter.value.on('error', () => {
      emitter.value?.off('duration')
      emitter.value?.off('progress')
      emitter.value?.off('done')
      emitter.value?.off('error')
      emitter.value = null
      nuxt.$alert.show('Failed to convert wave data. Please try again.')
      convertProgress.value = 0
      waveScaleValue.value = 0
      waveData.value = null
      duration.value = 0
    })
    emitter.value.on('done', ({ wave, scaleValue }: { wave: SharedArrayBuffer, scaleValue: number }) => {
      emitter.value?.off('duration')
      emitter.value?.off('progress')
      emitter.value?.off('done')
      emitter.value?.off('error')
      emitter.value = null
      convertProgress.value = 0
      waveScaleValue.value = scaleValue
      waveData.value = wave

      if (!willUseWhisper.value) { return }
      (async () => {
        console.log('whisper process start')
        const audioFile = await convertAsAudio(newFile)
        const audioFileObjectUrl = URL.createObjectURL(audioFile)
        const cues = await transcribe(audioFileObjectUrl, selectedLanguage.value)
        if (cues) {
          loadCues(cues)
        }
        console.log('whisper process done')

      })()
    })
  })

  onBeforeUnmount(() => {
    clearVideoFileObjectUrl()
  })
}