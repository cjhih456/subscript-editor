<template>
  <div>
    <input v-model="value" :type="types" />
    {{ userStore.userDisplayLang }}
  </div>
</template>
<script lang="ts" setup>
import { PropType, computed } from 'vue'
import { useUserStore } from '~/stores/UserStore'
const props = defineProps({
  modelValue: {
    type: [String, Boolean] as PropType<String | Boolean>,
    default: false,
  },
  types: { type: String, default: '' },
  messages: { type: Array as PropType<Array<String>>, default: () => [] },
})
const emit = defineEmits([
  'hover',
  'blur',
  'focus',
  'keypress',
  'error',
  'change',
  'update:modelValue',
])
const userStore = useUserStore()
onMounted(() => {
  userStore.loadUserInfo()
})
// const hover = ref<boolean>(false)
const value = computed({
  get() {
    return props.modelValue
  },
  set(v) {
    emit('update:modelValue', v)
  },
})
</script>
