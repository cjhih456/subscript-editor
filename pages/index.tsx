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
import { Button } from '~/components/ui/button'
import { Icon, Plus, Undo, Redo, Save } from 'lucide-vue-next'
import { Slider } from '~/components/ui/slider'
import { ClientOnly } from '#components'

export default defineNuxtComponent({
  name: 'IndexPage',
  setup () {
    const nuxt = useNuxtApp()
    const data = provideSubtitleController()
    const { create: createCue, get: getCue, allIds, undo, redo, undoAble, redoAble } = data.cueStore
    const cueCount = computed(() => allIds.value.length)
    const allCues = computed(() => allIds.value.map(id => getCue(id)))

    const { loadFFmpeg, convertWave } = useFFmpeg()
    const { videoFileObjectUrl, setVideoFileObjectUrl, clearVideoFileObjectUrl } = data
    onMounted(async () => {
      await loadFFmpeg()
    })
    onBeforeUnmount(() => {
      clearVideoFileObjectUrl()
    })

    async function onFileSelect (file: File | undefined) {
      if (!file) { return }
      const { wave, scaleValue, duration: convertedDuration } = await convertWave(file as File, data.audioRate.value)
      // take duration of file
      data.waveScaleValue.value = scaleValue
      data.duration.value = convertedDuration
      data.waveData.value = wave
      if (videoFileObjectUrl.value) {
        clearVideoFileObjectUrl()
      }
      setVideoFileObjectUrl(file)
      // const cueList = await whisperTranscribe(fileValue)
      // if (cueList) {
      //   data.cueStore.registWhisperCue = cueList
      // }
    }

    function saveAsFile () {
      const allText = nuxt.$webVtt.convertJsonToFile(allCues.value)
      const url = URL.createObjectURL(allText)
      const a = document.createElement('a')
      a.href = url
      a.download = 'subtitle.vtt'
      a.click()
      URL.revokeObjectURL(url)
    }

    const timeBarHeight = ref(20)
    const fontSize = ref(12)
    const waveHeight = ref(50)
    return {
      ...data,
      redo,
      undo,
      undoAble,
      redoAble,
      timeBarHeight,
      fontSize,
      waveHeight,
      allCues,
      cueCount,
      onFileSelect,
      createCue,
      saveAsFile
    }
  },
  render () {
    return <section class="flex flex-col gap-2">
      <AlertDisplay />
      <div class="flex flex-1">
        <div class="flex flex-col">
          <FileSelect onFileSelect={this.onFileSelect} />
          <div class="flex justify-between gap-2">
            <Button onClick={this.createCue}>
              <Plus />
            </Button>
            <Button onClick={this.undo} disabled={!this.undoAble}>
              <Undo />
            </Button>
            <Button onClick={this.redo} disabled={!this.redoAble}>
              <Redo />
            </Button>
            <Button onClick={this.saveAsFile}>
              <Save />
            </Button>
          </div>
          <CueEditArea />
        </div>
        <div class="flex-1">
          {/* <VideoPlayer /> */}
        </div>
      </div>
      <div class="flex flex-auto w-full">
        <div class="flex-1">
          {/* <BarArea>
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
          </BarArea> */}
        </div>
        <div class="flex-auto">
          <ClientOnly>
            {/* <Slider
              v-model={this.pixPerSec}
              orientation="vertical"
              step={5}
              max={1000}
              min={5}
            /> */}
          </ClientOnly>
        </div>
      </div>
      {/**
       * 
    // <VContainer class={styles['index-page']} fluid>
    
    //   <div class={styles['wave-area']}>
    //     <VRow class="tw-flex-nowrap">
    //       <VCol class="tw-overflow-scroll">
            <BarArea>
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
    //       </VCol>
    //       <VCol cols="auto" class={styles['level-slider']}>
    //         <VSlider
    //           v-model={this.pixPerSec}
    //           direction="vertical"
    //           reverse
    //           hideDetails
    //           step={5}
    //           max={1000}
    //           min={5}
    //         />
    //       </VCol>
    //     </VRow>
    //   </div>
    // </VContainer>
       */}
    </section>
  }
})
