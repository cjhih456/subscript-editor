import { VTextField } from 'vuetify/components'

export default defineNuxtComponent({
  name: 'TimeInput',
  props: {
    modelValue: {
      type: Number,
      default: ''
    }
  },
  emits: ['change', 'update:modelValue'],
  setup (props, ctx) {
    const nuxt = useNuxtApp()
    const data = reactive({
      input: ''
    })
    onMounted(() => {
      data.input = nuxt.$webVtt.convertSecondToTime(props.modelValue)
    })
    watch(() => props.modelValue, (newVal, oldVal) => {
      if (newVal !== oldVal) {
        if (nuxt.$webVtt.timeFormatCheckForEdit(data.input) && nuxt.$webVtt.convertTimeToSecond(data.input) !== newVal) {
          data.input = nuxt.$webVtt.convertSecondToTime(newVal)
        } else {
          data.input = nuxt.$webVtt.convertSecondToTime(newVal)
        }
      }
    })
    watch(() => data.input, (newVal, oldVal) => {
      if (newVal === oldVal) { return }
      if (nuxt.$webVtt.timeFormatCheckForEdit(newVal)) {
        const num = nuxt.$webVtt.convertTimeToSecond(newVal)
        if (num) { return ctx.emit('update:modelValue', num) }
      }
    })
    return { data }
  },
  render () {
    return <VTextField
      v-model={this.data.input}
      hideDetails
      variant='outlined'
      density='compact'
    ></VTextField>
  }
})
