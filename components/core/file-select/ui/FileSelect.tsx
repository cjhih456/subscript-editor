import { VFileInput } from 'vuetify/lib/components/VFileInput/VFileInput.mjs'
import useFileSelect from '../composables/useFileSelect'

export default defineNuxtComponent({
  name: 'FileSelect',
  setup () {
    const { fileSelect, fileSelectRules } = useFileSelect()
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
