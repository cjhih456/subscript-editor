import { ref, provide } from 'vue'
import { type CueStoreInterface } from '~/components/core/cue/composables/useCueStore'

export const VIDEO_FILE = Symbol('videoFile')
export const SCROLL_VALUE = Symbol('scrollValue')
export const DURATION = Symbol('duration')
export const CURRENT_TIME = Symbol('currentTime')
export const PIX_PER_SEC = Symbol('pixPerSec')
export const WAVE_DATA = Symbol('waveData')
export const CUE_STORE = Symbol('cueStore')

export function provideSubtitleController () {
  const videoFile = ref<File | null>(null)
  const scrollValue = ref<number>(0)
  const duration = ref<number>(0)
  const currentTime = ref<number>(0)
  const pixPerSec = ref<number>(0)
  const waveData = ref<number[]>([])
  const cueStore = useCueStore()
  const displayWidth = ref<number>(0)

  provide(VIDEO_FILE, videoFile)
  provide(SCROLL_VALUE, scrollValue)
  provide(DURATION, duration)
  provide(CURRENT_TIME, currentTime)
  provide(PIX_PER_SEC, pixPerSec)
  provide(WAVE_DATA, waveData)
  provide(CUE_STORE, cueStore)

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

  return readonly({
    videoFile,
    scrollValue,
    duration,
    currentTime,
    pixPerSec,
    waveData,
    cueStore,
    displayWidth
  })
}

export function useVideoFile () {
  const videoFile = inject<Ref<File | null>>(VIDEO_FILE)
  if (!videoFile) {
    throw new Error('VIDEO_FILE is not injected')
  }
  return videoFile
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
