import { useVideoFile } from '~/components/core/provider/SubtitleControllerProvider'

export default function useFileSelect ({ onFileSelect }: {
  onFileSelect: (file: File | undefined) => void
}) {
  const nuxt = useNuxtApp()
  const videoFile = useVideoFile()

  function fileChangeEvent (e: InputEvent) {
    const target = e.target as HTMLInputElement
    if (target.files) {
      fileSelect(target.files[0])
    }
  }

  function fileSelect (file: File | File[] | undefined) {
    if (!file) { return }
    if (Array.isArray(file)) {
      videoFile.value = file[0] ?? undefined
    } else {
      videoFile.value = file
    }
    if (videoFile.value) {
      const valide = fileSelectRules(videoFile.value)
      if (typeof valide === 'string') {
        nuxt.$alert.show(valide)
      } else {
        onFileSelect(videoFile.value)
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
    fileChangeEvent
  }
}
