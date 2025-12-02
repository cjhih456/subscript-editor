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

  provide(VIDEO_FILE, videoFile)
  provide(SCROLL_VALUE, scrollValue)
  provide(DURATION, duration)
  provide(CURRENT_TIME, currentTime)
  provide(PIX_PER_SEC, pixPerSec)
  provide(WAVE_DATA, waveData)
  provide(CUE_STORE, cueStore)
}

export function useVideoFile () {
  return inject<Ref<File | null>>(VIDEO_FILE)
}

export function useScrollValue () {
  return inject<ComputedRef<number>>(SCROLL_VALUE)
}

export function useDuration () {
  return inject<ComputedRef<number>>(DURATION)
}

export function useCurrentTime () {
  return inject<ComputedRef<number>>(CURRENT_TIME)
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
