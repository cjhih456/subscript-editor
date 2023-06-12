<template>
  <div
    :class="{
      'default-layout': true,
      'no-hambug': !$slots.hambug,
      [themeClass]: true,
    }"
  >
    <header>
      <slot name="header" :toggle-event="toggleHambugMenu">
        Default header
      </slot>
    </header>
    <main>
      <div
        v-if="$slots.hambug"
        :class="{
          'hambug-menu': true,
          'is-mini': $hambuger.isMini,
          active: $hambuger.value,
        }"
      >
        <slot name="hambug">
          Default hambug
        </slot>
      </div>
      <div
        :class="{
          ['content']: true,
        }"
      >
        <slot> Default content </slot>
      </div>
    </main>
    <div id="dialog-area" />
  </div>
</template>
<script setup>
import { useNuxtApp } from '#app'
import { mixin, mixinProps } from '~/plugins/Themeable'
const props = defineProps(mixinProps)
const { themeClass } = mixin(props)
const nuxtApp = useNuxtApp()
function toggleHambugMenu () {
  nuxtApp.$hambuger.changer(!nuxtApp.$hambuger.value)
}
</script>
<style lang="sass" scoped>
@import ~/assets/styles/layouts/default.sass
</style>
