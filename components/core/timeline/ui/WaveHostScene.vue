<script setup lang="ts">
import type { Vector3 } from 'three'
import { TresCanvas } from '@tresjs/core'
import WaveHostMesh from './WaveHostMesh.vue'

const appConfig = useAppConfig()
const hostEl = useTemplateRef<HTMLDivElement>('hostEl')
const hostWidth = ref(1)
const cameraPosition = [0, 0, 1] as unknown as Vector3

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  if (!hostEl.value) { return }
  const update = () => {
    if (!hostEl.value) { return }
    hostWidth.value = Math.max(1, Math.floor(hostEl.value.clientWidth))
  }
  update()
  resizeObserver = new ResizeObserver(update)
  resizeObserver.observe(hostEl.value)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
})
</script>

<template>
  <div
    ref="hostEl"
    class="h-full w-full overflow-hidden rounded-xl"
  >
    <ClientOnly>
      <TresCanvas
        :clear-color="appConfig.three.clearColor"
        class="!h-full !w-full"
        :alpha="false"
        :dpr="[1, 2]"
        :gl="{ preserveDrawingBuffer: true, antialias: false }"
      >
        <!-- Camera kept for Tres render loop; mesh is clip-space fullscreen -->
        <TresOrthographicCamera
          :position="cameraPosition"
          :left="-1"
          :right="1"
          :top="1"
          :bottom="-1"
          :near="0.1"
          :far="10"
          :manual="true"
        />
        <WaveHostMesh :host-width="hostWidth" />
      </TresCanvas>
    </ClientOnly>
  </div>
</template>
