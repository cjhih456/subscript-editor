import { VExpansionPanel, VExpansionPanelTitle, VExpansionPanelText, VRow, VCol, VBtn, VIcon, VTextarea } from 'vuetify/components'
import { useForm, useField } from 'vee-validate'
import { object, string, number } from 'yup'
import { toTypedSchema } from '@vee-validate/yup'
import { mdiTrashCan } from '@mdi/js'
import { useCueStore } from '~/components/core/provider/SubtitleControllerProvider'
import TimeInput from '~/components/core/cue/ui/TimeInput'

const schema = toTypedSchema(object({
  startTime: number().required(),
  endTime: number().required(),
  text: string()
}))

export default defineNuxtComponent({
  name: 'CueEdit',
  props: {
    idx: {
      type: String,
      default: ''
    }
  },
  setup ({ idx }) {
    const nuxt = useNuxtApp()
    const form = useTemplateRef<HTMLFormElement>('form')

    const { get: getCue, update: updateCue, remove: removeCue } = useCueStore()
    const cue = computed(() => getCue(idx))

    const { handleSubmit, validate } = useForm({
      validationSchema: schema,
      initialValues: {
        startTime: cue.value.startTime || 0,
        endTime: cue.value.endTime || 0,
        text: cue.value.text || ''
      }
    })

    const startTime = useField<number>('startTime')
    const endTime = useField<number>('endTime')
    const text = useField<string>('text')

    const startTimeDisplay = computed(() => {
      return nuxt.$webVtt.convertSecondToTime(startTime.value.value)
    })
    const endTimeDisplay = computed(() => {
      return nuxt.$webVtt.convertSecondToTime(endTime.value.value)
    })

    watch(() => cue.value, () => {
      if (endTime.value.value !== cue.value.endTime) {
        endTime.setValue(cue.value.endTime || 0)
      }
      if (startTime.value.value !== cue.value.startTime) {
        startTime.setValue(cue.value.startTime || 0)
      }
      if (text.value.value !== cue.value.text) {
        text.setValue(cue.value.text || '')
      }
    })

    const submit = handleSubmit((values) => {
      updateCue(idx, {
        ...cue.value,
        ...values
      })
      return false
    })
    const onChange = async () => {
      const result = await validate()
      if (!result.values) { return }
      form.value?.requestSubmit()
    }
    const onTextChange = (changedValue: string) => {
      text.value.value = changedValue
      onChange()
    }
    const deleteCue = () => {
      removeCue(idx)
    }
    return {
      submit,
      deleteCue,
      onChange,
      onTextChange,
      startTimeDisplay,
      endTimeDisplay,
      startTime,
      endTime,
      text
    }
  },
  render () {
    // TODO: vue-shadcn/ui 적용시 수정
    return <VExpansionPanel>
      <VExpansionPanelTitle>
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
      <VExpansionPanelText>
        <form ref="form" onSubmit={this.submit} >
          <VRow>
            <VCol>
              <TimeInput
                v-model={this.startTime.value.value}
                onChange={this.onChange}
              />
            </VCol>
            <VCol>
              <TimeInput
                v-model={this.endTime.value.value}
                onChange={this.onChange}
              />
            </VCol>
          </VRow>
          <VTextarea
            class={['tw-my-2']}
            v-model:modelValue={this.text.value.value}
            hideDetails
            onUpdate:modelValue={this.onTextChange}
          />
        </form>
      </VExpansionPanelText>
    </VExpansionPanel >
  }
})
