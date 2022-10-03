<template>
  <div>
    <input v-model="value" :type="types">
  </div>
</template>
<script lang="ts">
import { ref, PropType, computed } from 'vue'
import { defineNuxtComponent } from '#app'
export default defineNuxtComponent({
  name: 'Input',
  props: {
    modelValue: {
      type: [String, Boolean] as PropType<String | Boolean>,
      default: false
    },
    types: { type: String, default: '' },
    messages: { type: Array as PropType<Array<String>>, default: () => [] }
  },
  emits: [
    'hover',
    'blur',
    'focus',
    'keypress',
    'error',
    'change',
    'update:modelValue'
  ],
  setup (props, { emit }) {
    const hover = ref<boolean>(false)
    const value = computed({
      get () {
        return props.modelValue
      },
      set (v) {
        emit('update:modelValue', v)
      }
    })
    return {
      value,
      hover,
      ...props
    }
  },
  methods: {}
})
</script>
