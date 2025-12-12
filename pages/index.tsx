import AlertDisplay from '~/components/core/alert/ui/AlertDisplay'
import VideoPlayer from '~/components/VideoPlayer/VideoPlayer'
import { provideSubtitleController } from '~/components/core/provider/SubtitleControllerProvider'
import FileSelect from '~/components/core/file-select/ui/FileSelect.vue'
import useFFmpeg from '~/components/core/file-select/composables/useFFmpeg'
import TimeBar from '~/components/core/timeline/ui/TimeBar'
import WaveBar from '~/components/core/timeline/ui/WaveBar'
import BarArea from '~/components/core/timeline/ui/BarArea'
import CueBar from '~/components/core/cue/ui/CueBar'
import CueEditArea from '~/components/core/cue/ui/CueEditArea'
import CurrentTimeCursor from '~/components/core/timeline/ui/CurrentTimeCursor'
import CurrentCursor from '~/components/core/timeline/ui/CurrentCursor'
import { Slider } from '~/components/ui/slider'
import { ClientOnly } from '#components'
import type EventEmitter from 'eventemitter3'
import { Progress } from '~/components/ui/progress'

export default defineNuxtComponent({
  name: 'IndexPage',
  setup () {
    const nuxt = useNuxtApp()
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

    const { loadFFmpeg, convertWave } = useFFmpeg()
    const emitter = ref<EventEmitter | null>(null)
    const { videoFileObjectUrl, setVideoFileObjectUrl, clearVideoFileObjectUrl } = data
    onMounted(async () => {
      await loadFFmpeg()
    })
    onBeforeUnmount(() => {
      clearVideoFileObjectUrl()
    })

    async function onFileSelect (file: File | undefined) {
      if (!file) { return }
      emitter.value = await convertWave(file as File, data.audioRate.value)
      emitter.value.on('duration', (duration: number) => {
        data.duration.value = duration
      })
      emitter.value.on('progress', (progress: number) => {
        if(data.duration.value === 0) { return }
        data.convertProgress.value = Math.round((progress / data.duration.value) * 100)
      })
      emitter.value.on('error', () => {
        emitter.value?.off('duration')
        emitter.value?.off('progress')
        emitter.value?.off('done')
        emitter.value?.off('error')
        emitter.value = null
        nuxt.$alert.show('Failed to convert wave data. Please try again.')
        data.convertProgress.value = 0
        data.waveScaleValue.value = 0
        data.waveData.value = null
        data.duration.value = 0
      })
      emitter.value.on('done', ({ wave, scaleValue }: { wave: SharedArrayBuffer, scaleValue: number }) => {
        emitter.value?.off('duration')
        emitter.value?.off('progress')
        emitter.value?.off('done')
        emitter.value?.off('error')
        emitter.value = null
        data.convertProgress.value = 0
      data.waveScaleValue.value = scaleValue
      data.waveData.value = wave
      })
      if (videoFileObjectUrl.value) {
        clearVideoFileObjectUrl()
      }
      setVideoFileObjectUrl(file)
      // const cueList = await whisperTranscribe(fileValue)
      // if (cueList) {
      //   data.cueStore.registWhisperCue = cueList
      // }
    }

    const allCues = computed(() => data.cueStore.allIds.value.map(id => data.cueStore.get(id)))

    return {
      ...data,
      pixPerSec,
      timeBarHeight,
      fontSize,
      waveHeight,
      allCues,
      isMobile,
      onFileSelect,
    }
    
  },
  render () {
    return <section class="flex flex-col gap-2 flex-1 p-4">
      <AlertDisplay />
      <div class="flex gap-2 flex-col md:grow md:flex-row">
        <div class="flex flex-col grow md:grow-0">
          <FileSelect onFileSelect={this.onFileSelect} />
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
        {
          this.convertProgress > 0 ? (<>
            <div class="fixed top-0 bottom-0 left-0 right-0 bg-gray-500/30 z-10 flex items-center justify-center">
              <div class="flex-1 p-4">
                <Progress class="shadow-xl shadow-primary" modelValue={this.convertProgress} max={100} />
              </div>
            </div>
          </>) : (<></>)
        }
      </ClientOnly>
    </section>
  }
})
