import { ref, provide } from 'vue'
import useCueStoreOrigin from '~/components/core/cue/composables/useCueStore'
import { type CueStoreInterface } from '~/components/core/cue/composables/useCueStore'

export const VIDEO_FILE = Symbol('videoFile')
export const VIDEO_FILE_OBJECT_URL = Symbol('videoFileObjectUrl')
export const SCROLL_VALUE = Symbol('scrollValue')
export const DURATION = Symbol('duration')
export const CURRENT_TIME = Symbol('currentTime')
export const PIX_PER_SEC = Symbol('pixPerSec')
export const WAVE_DATA = Symbol('waveData')
export const CUE_STORE = Symbol('cueStore')
export const WAVE_MIN_MAX_VALUE = Symbol('waveMinMaxValue')
export const DISPLAY_WIDTH = Symbol('displayWidth')
export const AUDIO_RATE = Symbol('audioRate')

interface VideoFileObjectUrl {
  videoFileObjectUrl: Ref<string | null>,
  setVideoFileObjectUrl: (file: File) => void,
  clearVideoFileObjectUrl: () => void
}

export function provideSubtitleController () {
  const videoFile = ref<File | null>(null)
  const videoFileObjectUrl = ref<string | null>(null)
  function setVideoFileObjectUrl (file: File) {
    videoFileObjectUrl.value = URL.createObjectURL(file)
  }
  function clearVideoFileObjectUrl () {
    if (videoFileObjectUrl.value) {
      URL.revokeObjectURL(videoFileObjectUrl.value)
    }
    videoFileObjectUrl.value = null
  }
  const scrollValue = ref<number>(0)
  const duration = ref<number>(0)
  const currentTime = ref<number>(0)
  const pixPerSec = ref<number>(1000)
  const waveData = ref<number[]>([])
  const waveMinMaxValue = ref<{ min: number, max: number }>({ min: 0, max: 0 })
  const cueStore = useCueStoreOrigin()
  const displayWidth = ref<number>(0)
  const audioRate = ref<number>(200)

  provide(VIDEO_FILE, videoFile)
  provide<VideoFileObjectUrl>(VIDEO_FILE_OBJECT_URL, {
    videoFileObjectUrl,
    setVideoFileObjectUrl,
    clearVideoFileObjectUrl
  })
  provide(SCROLL_VALUE, scrollValue)
  provide(DURATION, duration)
  provide(CURRENT_TIME, currentTime)
  provide(PIX_PER_SEC, pixPerSec)
  provide(WAVE_DATA, waveData)
  provide(WAVE_MIN_MAX_VALUE, waveMinMaxValue)
  provide(CUE_STORE, cueStore)
  provide(DISPLAY_WIDTH, displayWidth)
  provide(AUDIO_RATE, audioRate)

  function windowResizeEvent () {
    displayWidth.value = document.documentElement.offsetWidth
  }

  onMounted(() => {
    window.addEventListener('resize', windowResizeEvent, false)
    windowResizeEvent()
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', windowResizeEvent, false)
  })

  return {
    videoFile,
    videoFileObjectUrl,
    setVideoFileObjectUrl,
    clearVideoFileObjectUrl,
    scrollValue,
    duration,
    currentTime,
    pixPerSec,
    waveData,
    cueStore,
    waveMinMaxValue,
    displayWidth,
    audioRate
  }
}

export function useVideoFile () {
  const videoFile = inject<Ref<File | null>>(VIDEO_FILE)
  if (!videoFile) {
    throw new Error('VIDEO_FILE is not injected')
  }
  return videoFile
}

export function useVideoFileObjectUrl () {
  const videoFileObjectUrl = inject<VideoFileObjectUrl>(VIDEO_FILE_OBJECT_URL)
  if (!videoFileObjectUrl) {
    throw new Error('VIDEO_FILE_OBJECT_URL is not injected')
  }
  return videoFileObjectUrl
}

export function useScrollValue () {
  const scrollValue = inject<ComputedRef<number>>(SCROLL_VALUE)
  if (!scrollValue) {
    throw new Error('SCROLL_VALUE is not injected')
  }
  return scrollValue
}

export function useDuration () {
  const duration = inject<ComputedRef<number>>(DURATION)
  if (!duration) {
    throw new Error('DURATION is not injected')
  }
  return duration
}

export function useWaveData () {
  const waveData = inject<ComputedRef<number[]>>(WAVE_DATA)
  if (!waveData) {
    throw new Error('WAVE_DATA is not injected')
  }
  return waveData
}

export function useWaveMinMaxValue () {
  const waveMinMaxValue = inject<ComputedRef<{ min: number, max: number }>>(WAVE_MIN_MAX_VALUE)
  if (!waveMinMaxValue) {
    throw new Error('WAVE_MIN_MAX_VALUE is not injected')
  }
  return waveMinMaxValue
}

export function useCurrentTime () {
  const currentTime = inject<ComputedRef<number>>(CURRENT_TIME)
  if (!currentTime) {
    throw new Error('CURRENT_TIME is not injected')
  }
  return currentTime
}

export function usePixPerSec () {
  const pixPerSec = inject<ComputedRef<number>>(PIX_PER_SEC)
  if (!pixPerSec) {
    throw new Error('PIX_PER_SEC is not injected')
  }
  return pixPerSec
}

export function useCueStore (): CueStoreInterface {
  const cueStore = inject<CueStoreInterface>(CUE_STORE)
  if (!cueStore) {
    throw new Error('CUE_STORE is not injected')
  }
  return cueStore
}

export function useDisplayWidth () {
  const displayWidth = inject<ComputedRef<number>>(DISPLAY_WIDTH)
  if (!displayWidth) {
    throw new Error('DISPLAY_WIDTH is not injected')
  }
  return displayWidth
}

export function useAudioRate () {
  const audioRate = inject<ComputedRef<number>>(AUDIO_RATE)
  if (!audioRate) {
    throw new Error('AUDIO_RATE is not injected')
  }
  return audioRate
}
