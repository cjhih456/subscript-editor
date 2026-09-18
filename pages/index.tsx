import AlertDisplay from '~/components/core/alert/ui/AlertDisplay'
import VideoPlayer from '~/components/VideoPlayer/VideoPlayer'
import { useDisplayWidth, usePixPerSec, useCueStore, useCurrentTime, useVideoFileObjectUrl } from '~/components/core/provider/SubtitleControllerProvider'
import TimeBar from '~/components/core/timeline/ui/TimeBar'
import WaveHostScene from '~/components/core/timeline/ui/WaveHostScene.vue'
import BarArea from '~/components/core/timeline/ui/BarArea'
import CueBar from '~/components/core/cue/ui/CueBar'
import CueEditArea from '~/components/core/cue/ui/CueEditArea'
import LumenInspector from '~/components/core/cue/ui/LumenInspector'
import { Slider } from '~/components/ui/slider'
import { ClientOnly } from '#components'
import useWaveConverter from '~/components/core/ffmpeg/composables/useWaveConverter'

export default defineNuxtComponent({
  name: 'IndexPage',
  setup () {
    const { get: getCue, allIds } = useCueStore()
    const displayWidth = useDisplayWidth()
    const pixPerSecOrigin = usePixPerSec()
    const currentTime = useCurrentTime()
    const { videoFileObjectUrl } = useVideoFileObjectUrl()

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
    const waveHostHeight = ref(100)

    const allCues = computed(() => allIds.value.map(id => getCue(id)))

    return {
      videoFileObjectUrl,
      currentTime,
      pixPerSec,
      timeBarHeight,
      fontSize,
      waveHostHeight,
      allCues,
      isMobile
    }
  },
  render () {
    return <section class="flex h-full min-h-0 flex-1 flex-col bg-background text-foreground">
      <AlertDisplay />
      <div class="flex min-h-0 flex-1 flex-col gap-3 p-3 md:flex-row">
        <div class={this.isMobile ? 'order-3 h-64' : 'w-[280px] shrink-0'}>
          <ClientOnly>
            <CueEditArea class="h-full" />
          </ClientOnly>
        </div>
        <div class="min-h-0 min-w-0 flex-1 self-stretch">
          <VideoPlayer
            v-model:currentTime={this.currentTime}
            subscript={this.allCues}
            src={this.videoFileObjectUrl || undefined}
          />
        </div>
        {!this.isMobile
          ? <div class="w-[280px] shrink-0">
            <LumenInspector />
          </div>
          : null}
      </div>
      <div class="flex h-[168px] w-full shrink-0 gap-4 border-t border-border bg-sidebar px-4 py-3">
        <div class="flex min-w-0 flex-1 flex-col gap-2">
          <div class="flex items-center justify-between font-mono text-[11px] text-muted-foreground">
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
                      <WaveHostScene />
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
        <div class="flex w-8 shrink-0 items-stretch">
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
      {this.isMobile
        ? <div class="p-3">
          <LumenInspector />
        </div>
        : null}
    </section>
  }
})
