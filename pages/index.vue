<template>
  <div>
    isDefault
    <Input v-model="inputValue" />
    <SecondInput v-model="inputValue" />
    <button class="" @click="changeTheme">change Theme</button>
    <button class="" @click="changeHeader">change header</button>
  </div>
</template>
<script setup>
import { useNuxtApp } from '#app'
import Input from '~~/components/forms/Input.vue'
import SecondInput from '~~/components/forms/SecondInput.vue'
const inputValue = ref('')
function changeTheme() {
  const nuxtApp = useNuxtApp()
  if (nuxtApp.$theme.changer() === 'light') {
    nuxtApp.$theme.changer('dark')
  } else {
    nuxtApp.$theme.changer('light')
  }
}
function changeHeader() {
  const nuxtApp = useNuxtApp()
  if (nuxtApp.$header.getHeaderComponent()) {
    nuxtApp.$header.changer('no-header')
  } else {
    nuxtApp.$header.changer('default')
  }
}
</script>
