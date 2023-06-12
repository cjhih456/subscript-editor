<template>
  <button type="button" :class="classes" :style="style" @click="onClick">
    {{ label }}
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  label: string,
  primary?: boolean,
  size?: 'small'| 'medium' | 'large',
  backgroundColor?: string
}>(), {
  primary: false,
  size: 'small',
  backgroundColor: undefined
})
const emit = defineEmits(['click'])
const classes = computed(() => ({
  'storybook-button': true,
  'storybook-button--primary': props.primary,
  'storybook-button--secondary': !props.primary,
  [`storybook-button--${props.size || 'medium'}`]: true
}))
const style = computed(() => ({
  backgroundColor: props.backgroundColor
}))
function onClick () {
  emit('click')
}
</script>
<style lang="scss" src="./button.scss" scoped></style>
