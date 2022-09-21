<template>
  <NuxtLayout>
    <template #header>
      <component :is="headerStatus" v-if="headerStatus"></component>
    </template>
    <template #hambuger>
      <component :is="hambugerStatus" v-if="hambugerStatus"></component>
    </template>
    <NuxtLoadingIndicator :duration="3000" />
    <NuxtPage />
  </NuxtLayout>
</template>
<script setup>
import { useNuxtApp, useHead } from '#app'
import { computed } from 'vue'
const nuxtApp = useNuxtApp()
const headerStatus = computed(() => nuxtApp.$header.getHeaderComponent())
const hambugerStatus = computed(() => nuxtApp.$hambuger.getHambugerComponent())
useHead({
  charset: 'utf8',
})
</script>
