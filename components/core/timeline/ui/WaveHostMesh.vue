<script setup lang="ts">
import { Color, Vector2 } from 'three'
import { useLoop } from '@tresjs/core'
import type { Ref } from 'vue'
import useWaveformTexture from '../composables/useWaveformTexture'
import fragmentShader from '~/assets/shaders/lumen-waveform.frag.glsl?raw'

const props = defineProps<{
  hostWidth: number
}>()

const appConfig = useAppConfig()
const hostWidthRef = toRef(props, 'hostWidth') as Ref<number>
const { texture, playhead, hasData } = useWaveformTexture(hostWidthRef)

const prefersReducedMotion = ref(false)

onMounted(() => {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)')
  prefersReducedMotion.value = media.matches
  const onChange = () => {
    prefersReducedMotion.value = media.matches
  }
  media.addEventListener('change', onChange)
  onBeforeUnmount(() => {
    media.removeEventListener('change', onChange)
  })
})

// Clip-space fullscreen quad — ignores camera frustum / aspect auto-resize
const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

const uniforms = {
  u_resolution: { value: new Vector2(1, 1) },
  u_magenta: { value: new Color(appConfig.three.magenta) },
  u_blue: { value: new Color(appConfig.three.blue) },
  u_playhead: { value: 0 },
  u_wave: { value: texture.value },
  u_hasData: { value: 0 },
  u_showPlayhead: { value: 1 }
}

watch(texture, (next) => {
  uniforms.u_wave.value = next
})

watch(playhead, (next) => {
  uniforms.u_playhead.value = next
}, { immediate: true })

watch(hasData, (next) => {
  uniforms.u_hasData.value = next ? 1 : 0
}, { immediate: true })

watch(prefersReducedMotion, (next) => {
  uniforms.u_showPlayhead.value = next ? 0 : 1
}, { immediate: true })

const { onBeforeRender } = useLoop()
onBeforeRender(({ renderer }) => {
  // Drawing-buffer size matches gl_FragCoord under devicePixelRatio
  renderer.getDrawingBufferSize(uniforms.u_resolution.value)
  uniforms.u_wave.value = texture.value
  uniforms.u_playhead.value = playhead.value
  uniforms.u_hasData.value = hasData.value ? 1 : 0
  uniforms.u_showPlayhead.value = prefersReducedMotion.value ? 0 : 1
})
</script>

<template>
  <TresMesh>
    <TresPlaneGeometry :args="[2, 2]" />
    <TresShaderMaterial
      :vertex-shader="vertexShader"
      :fragment-shader="fragmentShader"
      :uniforms="uniforms"
      :depth-test="false"
      :depth-write="false"
    />
  </TresMesh>
</template>
