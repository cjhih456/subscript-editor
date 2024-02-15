import { useField, useForm } from 'vee-validate'
import { VBtn, VCol, VExpansionPanel, VExpansionPanelText, VExpansionPanelTitle, VIcon, VRow, VTextarea } from 'vuetify/components'
import { toTypedSchema } from '@vee-validate/yup'
import { number, object, string } from 'yup'
import { mdiTrashCan } from '@mdi/js'
import { CueTimeInput } from '#components'
import styles from '~/assets/styles/components/cue/CueEdit.module.sass'

export default defineNuxtComponent({
  name: 'CueEdit',
  props: {
    idx: {
      type: String,
      default: ''
    },
    start: {
      type: Number,
      default: 0
    },
    end: {
      type: Number,
      default: 0
    },
    text: {
      type: String,
      default: ''
    }
  },
  emits: ['delete', 'update:start', 'update:end', 'update:text'],
  setup (props, { emit }) {
    const nuxt = useNuxtApp()
    const { handleSubmit } = useForm({
      validationSchema: toTypedSchema(object({
        startTime: number().required(),
        endTime: number().required(),
        text: string().notRequired()
      })),
      validateOnMount: false,
      initialValues: {
        startTime: 0,
        endTime: 0,
        text: ''
      }
    })
    const startTime = useField<number>('startTime')
    const endTime = useField<number>('endTime')
    const text = useField('text')

    const startTimeDisplay = computed(() => {
      return nuxt.$webVtt.convertSecondToTime(startTime.value.value)
    })
    const endTimeDisplay = computed(() => {
      return nuxt.$webVtt.convertSecondToTime(endTime.value.value)
    })
    watch(() => ({
      startTime: startTime.value.value,
      endTime: endTime.value.value,
      text: text.value.value
    }), (newVal, oldVal) => {
      if (newVal.startTime !== oldVal.startTime) { emit('update:start', newVal.startTime) }
      if (newVal.endTime !== oldVal.endTime) { emit('update:end', newVal.endTime) }
      if (newVal.text !== oldVal.text) { emit('update:text', newVal.text) }
    })
    watch(() => ({
      startTime: props.start,
      endTime: props.end
    }), (newVal, oldVal) => {
      if (newVal.startTime !== oldVal.startTime && startTime.value.value !== newVal.startTime) {
        startTime.value.value = newVal.startTime
      }
      if (newVal.endTime !== oldVal.endTime && endTime.value.value !== newVal.endTime) {
        endTime.value.value = newVal.endTime
      }
    })
    function deleteCue (e: Event) {
      e.stopPropagation()
      e.preventDefault()
      emit('delete', props.idx)
    }
    return { startTimeDisplay, endTimeDisplay, startTime, endTime, text, handleSubmit, deleteCue }
  },
  render () {
    return <VExpansionPanel class={styles['cue-edit']}>
      <VExpansionPanelTitle class={styles['title-area']}>
        <VRow no-gutters class={['tw-items-center']}>
          <VCol>
            start: {this.startTimeDisplay}
          </VCol>
          <VCol>
            end: {this.endTimeDisplay}
          </VCol>
          <VCol cols="auto">
            <VBtn
              color="tw-text-red-400"
              icon
              size={'small'}
              variant='outlined'
              flat
              onClick={this.deleteCue}
            >
              <VIcon icon={mdiTrashCan}></VIcon>
            </VBtn>
          </VCol>
        </VRow>
      </VExpansionPanelTitle>
      <VExpansionPanelText class={styles['text-area']}>
        <VRow>
          <VCol>
            <CueTimeInput v-model_lazy={this.startTime.value.value}></CueTimeInput>
          </VCol>
          <VCol>
            <CueTimeInput v-model_lazy={this.endTime.value.value}></CueTimeInput>
          </VCol>
        </VRow>
        <VTextarea
          class={['tw-my-2']}
          v-model={this.text.value.value}
          hideDetails
        />
      </VExpansionPanelText>
    </VExpansionPanel>
  }
})
