<template>
  <div>
    isDefault
    <Input v-model="inputValue" />
    <SecondInput v-model="inputValue" />
    <button class="" @click="changeTheme">
      change Theme
    </button>
    <button class="" @click="changeHeader">
      change header
    </button>
    <div class="dialog-area">
      <button ref="activator">
        activator
      </button>
      <DialogCDialog v-if="activator" :activator="activator" attache>
        <span>aaaaaa</span>
      </DialogCDialog>
    </div>
    <NuxtLink :to="{name: 'signinNeed'}">
      aaaaddddd
    </NuxtLink>
  </div>
</template>
<script setup lang="ts">
import type { VNode } from 'vue'
import { useNuxtApp } from '#app'
import Input from '~~/components/forms/Input.vue'
import SecondInput from '~~/components/forms/SecondInput.vue'
const inputValue = ref('')
const activator = ref<VNode | Element | null>(null)
function changeTheme () {
  const nuxtApp = useNuxtApp()
  if (nuxtApp.$theme.changer() === 'light') {
    nuxtApp.$theme.changer('dark')
  } else {
    nuxtApp.$theme.changer('light')
  }
}
function changeHeader () {
  const nuxtApp = useNuxtApp()
  if (nuxtApp.$header.getHeaderComponent()) {
    nuxtApp.$header.changer('no-header')
  } else {
    nuxtApp.$header.changer('default')
  }
}
</script>
<style lang="sass">
.dialog-area
  display: inline-block
  position: relative
</style>
