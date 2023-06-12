<template>
  <NuxtLayout>
    <template #header>
      <component :is="headerStatus" v-if="headerStatus" />
    </template>
    <template #hambuger>
      <component :is="hambugerStatus" v-if="hambugerStatus" />
    </template>
    <NuxtLoadingIndicator :duration="3000" />
    <NuxtPage />
  </NuxtLayout>
</template>
<script setup>
import { useNuxtApp } from '#app'
import { computed } from 'vue'
const nuxtApp = useNuxtApp()
const headerStatus = computed(() => nuxtApp.$header.getHeaderComponent())
const hambugerStatus = computed(() => nuxtApp.$hambuger.getHambugerComponent())
</script>
