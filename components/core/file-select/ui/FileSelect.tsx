import { VFileInput } from 'vuetify/lib/components/VFileInput/VFileInput.mjs'
import useFileSelect from '../composables/useFileSelect'

export default defineNuxtComponent({
  name: 'FileSelect',
  emits: ['fileSelect'],
  setup (_props, { emit }) {
    const { fileSelect, fileSelectRules } = useFileSelect({
      onFileSelect: (file: File | null) => {
        emit('fileSelect', file)
      }
    })
    return {
      fileSelect,
      fileSelectRules
    }
  },
  render () {
    return <VFileInput
      variant="outlined"
      density="compact"
      color="primary"
      showSize={1024}
      accept="video/*"
      onUpdate:modelValue={this.fileSelect}
      rules={[this.fileSelectRules]}
    />
  }
})
