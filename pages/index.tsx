import AlertDisplay from '~/components/core/alert/ui/AlertDisplay'
import VideoPlayer from '~/components/VideoPlayer/VideoPlayer'
import { provideSubtitleController } from '~/components/core/provider/SubtitleControllerProvider'
import FileSelect from '~/components/core/file-select/ui/FileSelect.vue'
import TimeBar from '~/components/core/timeline/ui/TimeBar'
import WaveBar from '~/components/core/timeline/ui/WaveBar'
import BarArea from '~/components/core/timeline/ui/BarArea'
import CueBar from '~/components/core/cue/ui/CueBar'
import CueEditArea from '~/components/core/cue/ui/CueEditArea'
import CurrentTimeCursor from '~/components/core/timeline/ui/CurrentTimeCursor'
import CurrentCursor from '~/components/core/timeline/ui/CurrentCursor'
import { Slider } from '~/components/ui/slider'
import { ClientOnly } from '#components'

export default defineNuxtComponent({
  name: 'IndexPage',
  setup () {
    const data = provideSubtitleController()

    const isMobile = computed(() => data.displayWidth.value < 768)

    const pixPerSec = computed<number[]>({
      get: () => [data.pixPerSec.value],
      set: (value) => {
        if (value[0] === undefined) { return }
        if (value[0] === data.pixPerSec.value) { return }
        data.pixPerSec.value = value[0]
      }
    })

    const timeBarHeight = ref(20)
    const fontSize = ref(12)
    const waveHeight = ref(50)

    const allCues = computed(() => data.cueStore.allIds.value.map(id => data.cueStore.get(id)))

    return {
      ...data,
      pixPerSec,
      timeBarHeight,
      fontSize,
      waveHeight,
      allCues,
      isMobile
    }
  },
  render () {
    return <section class="flex flex-col gap-2 flex-1 p-4">
      <AlertDisplay />
      <div class="flex gap-2 flex-col md:grow md:flex-row">
        <div class="flex flex-col grow md:grow-0">
          <FileSelect />
          <ClientOnly>
            {!this.isMobile ? <CueEditArea class="grow" /> : <></>}
          </ClientOnly>
        </div>
        <div class="md:flex-1">
          <ClientOnly>
            <VideoPlayer
              v-model:currentTime={this.currentTime}
              subscript={this.allCues}
              src={this.videoFileObjectUrl || undefined}
            />
          </ClientOnly>
        </div>
      </div>
      <div class="flex w-full grow-0 gap-4">
        <BarArea class="flex grow">
          {{
            canvas: () => (
              <>
                <TimeBar timeBarHeight={this.timeBarHeight} fontSize={this.fontSize} />
                <WaveBar waveHeight={this.waveHeight} />
              </>
            ),
            default: () => (
              <CueBar />
            ),
            cursor: () => (
              <>
                <CurrentTimeCursor />
                <CurrentCursor />
              </>
            )
          }}
        </BarArea>
        <div class="grow-0">
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
      <ClientOnly>
        {this.isMobile ? <CueEditArea class="grow" /> : <></>}
      </ClientOnly>
    </section>
  }
})
