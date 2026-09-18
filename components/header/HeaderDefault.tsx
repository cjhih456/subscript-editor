import SideMenu from "../core/side-menu/ui/SideMenu"
import { useWhisperProvider } from "../core/whisper"
import { useCurrentTime, useDuration, useVideoFile } from "../core/provider/SubtitleControllerProvider"
import { LazyCoreWhisperUiWhisperStatus } from "#components"

export default defineNuxtComponent({
  name: 'HeaderDefault',
  async setup () {
    const nuxt = useNuxtApp()
    const { willUseWhisper } = useWhisperProvider()
    const videoFile = useVideoFile()
    const currentTime = useCurrentTime()
    const duration = useDuration()

    const fileLabel = computed(() => videoFile.value?.name ?? 'No video')
    const timecode = computed(() => {
      const format = (sec: number) => nuxt.$webVtt.convertSecondToTime(sec).slice(3, 11)
      return `${format(currentTime.value)}  /  ${format(duration.value)}`
    })

    return { willUseWhisper, fileLabel, timecode }
  },
  render () {
    return <div class="flex h-14 items-center gap-4 border-b border-border bg-sidebar px-4">
      <div class="flex items-center gap-2.5">
        <div class="flex size-[22px] items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">+</div>
        <h3 class="text-base font-bold tracking-wide">LUMEN</h3>
      </div>
      <div class="flex min-w-0 flex-1 items-center gap-3 font-mono text-[13px]">
        <span class="truncate text-muted-foreground">{this.fileLabel}</span>
        <span class="text-foreground">{this.timecode}</span>
      </div>
      <div class="flex items-center gap-2">
        {this.willUseWhisper && (
          <div class="flex h-7 items-center gap-1.5 rounded-full bg-muted px-2.5">
            <LazyCoreWhisperUiWhisperStatus />
            <p class="text-xs text-muted-foreground">Whisper</p>
          </div>
        )}
        <SideMenu />
      </div>
    </div>
  }
})
