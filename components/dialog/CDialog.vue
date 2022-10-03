<template>
  <div class="dialog-shell" :class="{'attached-content': attache}">
    <teleport to="#dialog-area" :disabled="attache">
      <transition>
        <div
          v-if="lazyValueComputed"
          v-click-outside="{
            handler:clickOutsideEvnet,
            closeConditional,
            include: () => [activator]
          }"
          class="dialog-content"
          :class="{
            'fixed-content': fixed,
            'full-cover': fullCover
          }"
        >
          <slot name="default" />
        </div>
      </transition>
    </teleport>
  </div>
</template>
<script setup lang="ts">
import { PropType, VNode } from 'vue'
import ClickOutside from '../mixins/ClickOutside'
const vClickOutside = ClickOutside

const props = defineProps({
  attache: { type: Boolean, default: false },
  fixed: { type: Boolean, default: false },
  fullCover: { type: Boolean, default: false },
  activator: { type: Object as PropType<VNode | Element | null>, default: undefined },
  modelValue: {
    type: Boolean,
    default: false
  }
})
const emits = defineEmits(['update:modelValue'])
const lazyValue = ref(false)
const lazyValueComputed = computed({
  get () {
    return lazyValue.value
  },
  set (value) {
    emits('update:modelValue', lazyValue.value = value)
  }
})
watch(
  () => props.modelValue,
  (newVal, oldVal) => {
    if (newVal !== oldVal) { lazyValueComputed.value = newVal }
  }
)
function closeConditional () {
  return lazyValueComputed.value
}

function clickOutsideEvnet () {
  if (lazyValueComputed.value) { lazyValueComputed.value = false }
}
function activatorClickEvent () {
  lazyValueComputed.value = !lazyValueComputed.value
}
onMounted(() => {
  nextTick(() => {
    if (props.activator instanceof Element) {
      props.activator.addEventListener('click', activatorClickEvent)
    }
  })
})
onUpdated(() => {
  nextTick(() => {
    if (props.activator instanceof Element) {
      props.activator.addEventListener('click', activatorClickEvent)
    }
  })
})
onBeforeUpdate(() => {
  nextTick(() => {
    if (props.activator instanceof Element) {
      props.activator.removeEventListener('click', activatorClickEvent)
    }
  })
})
</script>
<style lang="sass">
.dialog-shell
  position: relative
  &.attached-content
    > *
      position: absolute
.dialog-content
  position: absolute
  &.fixed-content
    position: fixed
    top: var(--dialog-position-top, 0) !important
    left: var(--dialog-position-left, 0) !important
    &.full-cover
      width: 100%
      height: 100%
</style>
