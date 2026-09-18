<script setup lang="ts">
import type { Vector3 } from 'three'
import { TresCanvas } from '@tresjs/core'
import StageIdleMesh from './StageIdleMesh.vue'

const appConfig = useAppConfig()
const colorMode = useColorMode()
const position = [0, 0, 1.6] as unknown as Vector3
const clearColor = computed(() =>
  colorMode.value === 'dark' ? appConfig.three.clearColor : appConfig.three.clearColorLight
)
</script>

<template>
  <div class="h-full w-full">
    <TresCanvas
      :clear-color="clearColor"
      class="h-full w-full"
    >
      <TresPerspectiveCamera :position="position" :fov="50" />
      <StageIdleMesh />
      <TresAmbientLight :intensity="0.35" />
    </TresCanvas>
  </div>
</template>
