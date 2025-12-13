<script setup lang="ts">
import { FileVideoCameraIcon } from 'lucide-vue-next';
import useVideoFileSelect from '../composables/useVideoFileSelect'

const { open } = useVideoFileSelect()
</script>
<template>
  <ClientOnly>
    <Button @click="() => open()">
      <FileVideoCameraIcon />
    </Button>
  </ClientOnly>
</template>