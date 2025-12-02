import { useVideoFile } from '~/components/core/provider/SubtitleControllerProvider'

export default function useFileSelect () {
  const videoFile = useVideoFile()
  function fileSelect (file: File | File[] | null) {
    if (!file) { return }
    if (Array.isArray(file)) {
      videoFile.value = file[0]
    } else {
      videoFile.value = file
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
    fileSelect,
    fileSelectRules
  }
}
