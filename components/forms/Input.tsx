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
    const value = computed({
      get () {
        return props.modelValue
      },
      set (v) {
        if (v !== value.value) { emit('update:modelValue', v) }
      }
    })
    return () => {
      return <div>
        <input v-model={value.value} type="types" />
      </div>
    }
  }
})
