<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"
import { Input } from '@/components/ui/input'

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <Input
    type="file"
    accept="video/*"
    :class="cn(
      'flex-1 rounded-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-transparent ring-offset-transparent dark:bg-transparent',
      props.class
    )"
  />
</template>