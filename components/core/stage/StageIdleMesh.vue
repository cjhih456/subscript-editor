<script setup lang="ts">
import { Color, Vector2 } from 'three'
import { useLoop } from '@tresjs/core'

const appConfig = useAppConfig()

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const fragmentShader = `
uniform float uTime;
uniform vec3 uMagenta;
uniform vec3 uBlue;
uniform vec3 uBase;
uniform vec2 uResolution;
varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  vec2 uv = vUv;
  vec2 p = uv * 2.0 - 1.0;
  p.x *= uResolution.x / max(uResolution.y, 1.0);

  float t = uTime * 0.15;
  vec3 wash = mix(uBlue, uMagenta, 0.5 + 0.5 * sin(t));
  float radial = 1.0 - smoothstep(0.2, 1.35, length(p));
  vec3 rgb = mix(uBase, wash * 0.22, radial);

  float grain = hash(gl_FragCoord.xy + vec2(uTime * 40.0, 0.0)) * 0.05;
  rgb += grain;

  float vig = smoothstep(1.25, 0.35, length(p));
  rgb *= vig;

  float scan = 0.97 + 0.03 * sin(uv.y * uResolution.y * 1.4 + uTime * 8.0);
  rgb *= scan;

  gl_FragColor = vec4(rgb, 1.0);
}
`

const colorMode = useColorMode()
const clearColorHex = computed(() =>
  colorMode.value === 'dark' ? appConfig.three.clearColor : appConfig.three.clearColorLight
)

const uniforms = {
  uTime: { value: 0 },
  uMagenta: { value: new Color(appConfig.three.magenta) },
  uBlue: { value: new Color(appConfig.three.blue) },
  uBase: { value: new Color(clearColorHex.value) },
  uResolution: { value: new Vector2(16, 9) }
}

watch(clearColorHex, (hex) => {
  uniforms.uBase.value.set(hex)
})

const { onBeforeRender } = useLoop()
onBeforeRender(({ elapsed, renderer }) => {
  uniforms.uTime.value = elapsed
  renderer.getSize(uniforms.uResolution.value)
})
</script>

<template>
  <TresMesh>
    <TresPlaneGeometry :args="[3.2, 1.8]" />
    <TresShaderMaterial
      :vertex-shader="vertexShader"
      :fragment-shader="fragmentShader"
      :uniforms="uniforms"
    />
  </TresMesh>
</template>
