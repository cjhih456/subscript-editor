<template>
  <NuxtLayout class="bg-background text-foreground">
    <template #header>
      <component :is="headerStatus" />
    </template>
    <template #default>
      <NuxtPage />
    </template>
  </NuxtLayout>
</template>
<script setup>
import { computed } from 'vue'
import { useNuxtApp } from '#app'
const nuxtApp = useNuxtApp()
const headerStatus = computed(() => nuxtApp.$header.getHeaderComponent())
</script>
