import { useFileDialog } from "@vueuse/core"
import type { VTTCueSlim } from "~/plugins/WebVttPlugin"

export default function useSubtitleFileSelect ({ onSuccess }: { onSuccess: (cues: (VTTCue | VTTCueSlim)[]) => void }) {
  const nuxt = useNuxtApp()
  
  const { open, reset, onChange } = useFileDialog({
    accept: 'text/vtt, text/sbv, text/srt',
    multiple: false,
  })

  onChange(async (files) => {
    if(!files) { return }
    const file = files.item(0)
    if (!file) { return }
    const content = await file.text()
    reset()

    const cueList = await nuxt.$webVtt.parseSubtitle(content)
    if (!cueList || !cueList.cues.length) { return }
    const cues = cueList.cues
    onSuccess(cues)
  })

  return {
    open
  }
}