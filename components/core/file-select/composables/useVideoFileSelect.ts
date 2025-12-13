import { useVideoFile } from '~/components/core/provider/SubtitleControllerProvider'
import { useFileDialog } from '@vueuse/core'

export default function useFileSelect () {
  const nuxt = useNuxtApp()
  const videoFile = useVideoFile()
  const { open, reset, onChange } = useFileDialog({
    accept: 'video/*',
    multiple: false,
  })
  onChange((files) => {
    if(!files) { return }
    const file = files.item(0)
    if(!file) { return }
    fileSelect(file)
    reset()
  })

  function fileSelect (file: File | File[] | undefined) {
    if (!file) { return }
    let fileToSelect: File | undefined = undefined
    if (Array.isArray(file)) {
      fileToSelect = file[0] ?? undefined
    } else {
      fileToSelect = file
    }
    if (fileToSelect) {
      const valide = fileSelectRules(fileToSelect)
      if (typeof valide === 'string') {
        nuxt.$alert.show(valide)
      } else {
        videoFile.value = fileToSelect
      }
    }
  }
  function fileSelectRules (value: File) {
    if (value && value.type.startsWith('video/')) {
      return true
    } else {
      return 'File must be a video'
    }
  }

  return {
    open
  }
}
