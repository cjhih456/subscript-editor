<script setup lang="ts">
import useFileSelect from '../composables/useFileSelect'
import { InputGroup, InputGroupVideoInput } from '~/components/ui/input-group'

const emit = defineEmits<{
  (e: 'fileSelect', file: File | undefined): void
}>()

const { fileChangeEvent } = useFileSelect({
  onFileSelect: (file: File | undefined) => {
    emit('fileSelect', file)
  }
})
</script>
<template>
  <ClientOnly>
    <InputGroup>
      <InputGroupVideoInput @change="fileChangeEvent"  />
    </InputGroup>
  </ClientOnly>
</template>