import {
  DataTexture,
  LinearFilter,
  NearestFilter,
  ClampToEdgeWrapping,
  RGBAFormat,
  UnsignedByteType
} from 'three'
import type { Ref } from 'vue'
import {
  useAudioRate,
  useCurrentTime,
  usePixPerSec,
  useScrollValue,
  useWaveData,
  useWaveScaleValue
} from '../../provider/SubtitleControllerProvider'

function createWaveTexture (width: number, pixels: Uint8Array) {
  const next = new DataTexture(pixels, width, 1, RGBAFormat, UnsignedByteType)
  next.magFilter = LinearFilter
  next.minFilter = NearestFilter
  next.wrapS = ClampToEdgeWrapping
  next.wrapT = ClampToEdgeWrapping
  next.generateMipmaps = false
  next.needsUpdate = true
  return next
}

/**
 * Downsample SharedArrayBuffer wave peaks into a 1D DataTexture for the sticky WaveHost.
 * Time mapping must match TimeBar: at CSS pixel x, time = scrollTime + x / pixPerSec.
 */
export default function useWaveformTexture (hostWidth: Ref<number>) {
  const pixPerSec = usePixPerSec()
  const audioRate = useAudioRate()
  const { time: scrollTime, value: scrollValue } = useScrollValue()
  const waveData = useWaveData()
  const waveScaleValue = useWaveScaleValue()
  const currentTime = useCurrentTime()

  const emptyData = new Uint8Array(4)
  emptyData[3] = 255

  const texture = shallowRef(createWaveTexture(1, emptyData))
  let pixelBuffer: Uint8Array | null = null
  let textureWidth = 1
  let rafId = 0

  const hasData = computed(() => Boolean(waveData.value && waveScaleValue.value > 0))

  const playhead = computed(() => {
    const width = hostWidth.value
    if (width <= 0) { return 0 }
    // Sticky host: playhead x in viewport CSS pixels → UV
    const x = (currentTime.value - scrollTime.value) * pixPerSec.value / width
    return Math.min(1, Math.max(0, x))
  })

  function rebuild () {
    const width = Math.max(1, Math.floor(hostWidth.value))
    const buffer = waveData.value
    const scale = waveScaleValue.value
    const pps = pixPerSec.value
    const rate = audioRate.value

    if (!pixelBuffer || textureWidth !== width) {
      pixelBuffer = new Uint8Array(width * 4)
      textureWidth = width
      const next = createWaveTexture(width, pixelBuffer)
      texture.value.dispose()
      texture.value = next
    }

    // Always write through the texture's backing store
    const pixels = texture.value.image.data as Uint8Array

    if (!buffer || scale <= 0 || pps <= 0 || rate <= 0) {
      pixels.fill(0)
      for (let i = 0; i < width; i++) {
        pixels[i * 4 + 3] = 255
      }
      texture.value.needsUpdate = true
      return
    }

    const waveDataArray = new Int8Array(buffer)
    const waveDataLength = buffer.byteLength
    // TimeBar: timeAt(x) = scrollTime + x / pixPerSec
    // sampleIndex = timeAt(x) * audioRate = (scrollLeft + x) * audioRate / pixPerSec
    const samplesPerPixel = rate / pps
    const scrollOffset = (scrollValue.value * rate) / pps

    for (let i = 0; i < width; i += 2) {
      const start = Math.floor(i * samplesPerPixel + scrollOffset)
      const end = Math.floor((i + 2) * samplesPerPixel + scrollOffset)

      let max = -127
      let min = 128
      let found = false

      if (start < waveDataLength) {
        const lo = Math.max(0, start)
        const hi = Math.min(waveDataLength, Math.max(end, lo + 1))
        for (let j = lo; j < hi; j++) {
          const value = waveDataArray[j]
          if (value === undefined) { break }
          found = true
          if (value > max) { max = value }
          if (value < min) { min = value }
        }
      }

      const maxNorm = found ? Math.max(0, Math.min(1, max / scale)) : 0
      const minNorm = found ? Math.max(0, Math.min(1, -min / scale)) : 0
      const r = Math.round(maxNorm * 255)
      const g = Math.round(minNorm * 255)

      for (let k = 0; k < 2 && i + k < width; k++) {
        const idx = (i + k) * 4
        pixels[idx] = r
        pixels[idx + 1] = g
        pixels[idx + 2] = 0
        pixels[idx + 3] = 255
      }
    }

    texture.value.needsUpdate = true
  }

  function scheduleRebuild () {
    if (rafId) { return }
    rafId = requestAnimationFrame(() => {
      rafId = 0
      rebuild()
    })
  }

  watch(
    () => [
      hostWidth.value,
      waveData.value,
      waveScaleValue.value,
      pixPerSec.value,
      scrollValue.value,
      audioRate.value
    ],
    scheduleRebuild,
    { immediate: true }
  )

  onBeforeUnmount(() => {
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = 0
    }
    texture.value.dispose()
    pixelBuffer = null
  })

  return {
    texture,
    playhead,
    hasData,
    rebuild
  }
}
