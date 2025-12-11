
import { useForm, useField } from 'vee-validate'
import { object, string, number } from 'yup'
import { toTypedSchema } from '@vee-validate/yup'
import { useCueStore } from '~/components/core/provider/SubtitleControllerProvider'
import TimeInput from '~/components/core/cue/ui/TimeInput'
import { AccordionContent, AccordionItem, AccordionTrigger } from '~/components/ui/accordion'
import { Button } from '~/components/ui/button'
import { TrashIcon } from 'lucide-vue-next'
import { InputGroup, InputGroupTextarea } from '~/components/ui/input-group'

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
    return <AccordionItem value={this.idx}>
      <AccordionTrigger>
        <div class="flex items-center justify-between w-[300px] px-2">
          <div class="flex items-center gap-2">
            <span>
              {this.startTimeDisplay}
            </span>
            <span>
              ~
            </span>
            <span>
              {this.endTimeDisplay}
            </span>
          </div>
          <div>
            <Button onClick={this.deleteCue}>
              <TrashIcon />
            </Button>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <form ref="form" onSubmit={this.submit} class="flex flex-col gap-2 p-2 w-[300px]">
          <div class="flex gap-2">
              <TimeInput
                v-model={this.startTime.value.value}
                onChange={this.onChange}
              />
              <TimeInput
                v-model={this.endTime.value.value}
                onChange={this.onChange}
              />
          </div>
          <InputGroup>
            <InputGroupTextarea
              modelValue={this.text.value.value}
              onUpdate:modelValue={this.onTextChange}
            />
          </InputGroup>
        </form>
      </AccordionContent>
    </AccordionItem>
  }
})
