import AlertDisplay from '~/components/core/alert/ui/AlertDisplay'
import VideoPlayer from '~/components/VideoPlayer/VideoPlayer'
import { useDisplayWidth, usePixPerSec, useCueStore, useCurrentTime, useVideoFileObjectUrl, useSelectedCueId } from '~/components/core/provider/SubtitleControllerProvider'
import TimeBar from '~/components/core/timeline/ui/TimeBar'
import BarArea from '~/components/core/timeline/ui/BarArea'
import CueBar from '~/components/core/cue/ui/CueBar'
import CueEditArea from '~/components/core/cue/ui/CueEditArea'
import LumenInspector from '~/components/core/cue/ui/LumenInspector'
import { Slider } from '~/components/ui/slider'
import { Sheet, SheetContent, SheetTitle } from '~/components/ui/sheet'
import { ClientOnly, LazyCoreTimelineUiWaveHostScene } from '#components'
import useWaveConverter from '~/components/core/ffmpeg/composables/useWaveConverter'

export default defineNuxtComponent({
  name: 'IndexPage',
  setup () {
    const { get: getCue, allIds } = useCueStore()
    const displayWidth = useDisplayWidth()
    const pixPerSecOrigin = usePixPerSec()
    const currentTime = useCurrentTime()
    const { videoFileObjectUrl } = useVideoFileObjectUrl()
    const selectedCueId = useSelectedCueId()

    useWaveConverter()

    const isMobile = computed(() => displayWidth.value < 768)

    const pixPerSec = computed<number[]>({
      get: () => [pixPerSecOrigin.value],
      set: (value) => {
        if (value[0] === undefined) { return }
        if (value[0] === pixPerSecOrigin.value) { return }
        pixPerSecOrigin.value = value[0]
      }
    })

    const timeBarHeight = ref(20)
    const fontSize = ref(12)
    const waveHostHeight = computed(() => isMobile.value ? 72 : 100)

    const allCues = computed(() => allIds.value.map(id => getCue(id)))

    const inspectorSheetOpen = computed({
      get: () => isMobile.value && selectedCueId.value !== null,
      set: (open: boolean) => {
        if (!open) { selectedCueId.value = null }
      }
    })

    return {
      videoFileObjectUrl,
      currentTime,
      pixPerSec,
      timeBarHeight,
      fontSize,
      waveHostHeight,
      allCues,
      isMobile,
      inspectorSheetOpen
    }
  },
  render () {
    const timeline = (
      <div class="flex h-full min-h-0 w-full gap-4">
        <div class="flex min-h-0 min-w-0 flex-1 flex-col gap-2">
          <div class="hidden items-center justify-between font-mono text-[11px] text-muted-foreground md:flex">
            <span>WAVEFORM</span>
            <span>pps {this.pixPerSec[0]}</span>
          </div>
          <BarArea class="flex min-h-0 flex-1 overflow-hidden rounded-xl">
            {{
              canvas: () => (
                <>
                  <TimeBar timeBarHeight={this.timeBarHeight} fontSize={this.fontSize} />
                  <div class="relative w-full overflow-hidden rounded-xl" style={{ height: `${this.waveHostHeight}px` }}>
                    <ClientOnly>
                      <LazyCoreTimelineUiWaveHostScene />
                    </ClientOnly>
                  </div>
                </>
              ),
              default: () => (
                <div
                  class="relative pointer-events-none"
                  style={{ marginTop: `-${this.waveHostHeight}px`, height: `${this.waveHostHeight}px` }}
                >
                  <CueBar />
                </div>
              )
            }}
          </BarArea>
        </div>
        <div class="hidden w-8 shrink-0 items-stretch md:flex">
          <ClientOnly>
            <Slider
              v-model={this.pixPerSec}
              orientation="vertical"
              max={1000}
              min={5}
              step={5}
              inverted
            />
          </ClientOnly>
        </div>
      </div>
    )

    return <section class="flex h-full min-h-0 flex-1 flex-col bg-background text-foreground">
      <AlertDisplay />
      <div class="grid min-h-0 flex-1 grid-cols-1 grid-rows-[280px_120px_minmax(0,1fr)] gap-3 p-3 md:grid-cols-[280px_minmax(0,1fr)_280px] md:grid-rows-[minmax(0,1fr)_168px] md:gap-x-3 md:gap-y-0 md:p-3 md:pb-0">
        <div class="row-start-3 min-h-0 md:col-start-1 md:row-start-1">
          <ClientOnly>
            <CueEditArea class="h-full" />
          </ClientOnly>
        </div>
        <div class="row-start-1 min-h-0 min-w-0 md:col-start-2 md:row-start-1">
          <VideoPlayer
            v-model:currentTime={this.currentTime}
            subscript={this.allCues}
            src={this.videoFileObjectUrl || undefined}
          />
        </div>
        <div class="hidden min-h-0 md:col-start-3 md:row-start-1 md:block">
          <LumenInspector />
        </div>
        <div class="row-start-2 min-h-0 overflow-hidden md:col-span-3 md:row-start-2 md:-mx-3 md:border-t md:border-border md:bg-sidebar md:px-4 md:py-3">
          {timeline}
        </div>
      </div>
      <Sheet
        open={this.inspectorSheetOpen}
        onUpdate:open={(open: boolean) => { this.inspectorSheetOpen = open }}
      >
        <SheetContent
          side="bottom"
          overlayClass="bg-black/40"
          class="max-h-[50vh] rounded-t-3xl border-border bg-sidebar p-4"
        >
          <div class="mx-auto mb-3 h-1 w-10 rounded-full bg-muted-foreground/40" />
          <SheetTitle class="sr-only">Selected cue</SheetTitle>
          <LumenInspector chrome={false} />
        </SheetContent>
      </Sheet>
    </section>
  }
})
