import { VIDEO_FILE, SCROLL_VALUE, DURATION, CURRENT_TIME, PIX_PER_SEC, CUE_STORE } from './SubtitleProvider'
import type useCueStoreType from './cue/composables/useCueStore'

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

export function useCueStore () {
  const cueStore = inject<ReturnType<typeof useCueStoreType>>(CUE_STORE)
  if (!cueStore) {
    throw new Error('CUE_STORE is not injected')
  }
  return cueStore
}
