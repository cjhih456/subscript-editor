import useCueStore from './cue/composables/useCueStore'

export const VIDEO_FILE = Symbol('videoFile')
export const SCROLL_VALUE = Symbol('scrollValue')
export const DURATION = Symbol('duration')
export const CURRENT_TIME = Symbol('currentTime')
export const PIX_PER_SEC = Symbol('pixPerSec')
export const WAVE_DATA = Symbol('waveData')
export const CUE_STORE = Symbol('cueStore')

export default defineNuxtComponent({
  name: 'SubtitleProvider',
  setup () {
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
})
