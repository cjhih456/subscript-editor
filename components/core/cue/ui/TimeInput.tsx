import { VTextField } from 'vuetify/components'

export default defineNuxtComponent({
  name: 'TimeInput',
  props: {
    modelValue: {
      type: Number,
      default: 0
    },
    errorMessage: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue', 'change'],
  setup (props, { emit }) {
    const modelValue = useModel(props, 'modelValue')
    const nuxt = useNuxtApp()
    const data = reactive({
      input: ''
    })
    onMounted(() => {
      data.input = nuxt.$webVtt.convertSecondToTime(props.modelValue)
    })
    watch(() => props.modelValue, (newVal, oldVal) => {
      if (newVal === oldVal) { return }
      const newNum = nuxt.$webVtt.convertSecondToTime(newVal)
      if (newNum === data.input) { return }
      data.input = newNum
    })
    watch(() => data.input, (newVal, oldVal) => {
      if (newVal === oldVal) { return }
      if (!nuxt.$webVtt.timeFormatCheckForEdit(newVal)) { return }
      const num = nuxt.$webVtt.convertTimeToSecond(newVal)
      if (num === modelValue.value) { return }
      modelValue.value = num
      emit('change', num)
    })
    return { data }
  },
  render () {
    return <VTextField
      v-model={this.data.input}
      errorMessages={this.errorMessage}
      hideDetails
      density='compact'
    ></VTextField>
  }
})
