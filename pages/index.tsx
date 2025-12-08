import { VBtn, VCol, VContainer, VIcon, VRow, VSlider } from 'vuetify/components'
import { mdiFileExport, mdiPlus, mdiRedo, mdiUndo } from '@mdi/js'
import styles from '~/assets/styles/pages/index.module.sass'
import AlertDisplay from '~/components/core/alert/ui/AlertDisplay'
import VideoPlayer from '~/components/VideoPlayer/VideoPlayer'
import { provideSubtitleController } from '~/components/core/provider/SubtitleControllerProvider'
import FileSelect from '~/components/core/file-select/ui/FileSelect'
import useFFmpeg from '~/components/core/file-select/composables/useFFmpeg'
import TimeBar from '~/components/core/timeline/ui/TimeBar'
import WaveBar from '~/components/core/timeline/ui/WaveBar'
import BarArea from '~/components/core/timeline/ui/BarArea'
import CueBar from '~/components/core/cue/ui/CueBar'
import CueEditArea from '~/components/core/cue/ui/CueEditArea'
import CurrentTimeCursor from '~/components/core/timeline/ui/CurrentTimeCursor'
import CurrentCursor from '~/components/core/timeline/ui/CurrentCursor'

export default defineNuxtComponent({
  name: 'IndexPage',
  setup () {
    const nuxt = useNuxtApp()
    const data = provideSubtitleController()
    const { create: createCue, get: getCue, allIds, undo, redo, undoAble, redoAble } = data.cueStore
    const cueCount = computed(() => allIds.value.length)
    const allCues = computed(() => allIds.value.map(id => getCue(id)))

    const { loadFFmpeg, convertWave, waveSerialize } = useFFmpeg()
    const { videoFileObjectUrl, setVideoFileObjectUrl, clearVideoFileObjectUrl } = data
    onMounted(async () => {
      await loadFFmpeg()
    })
    onBeforeUnmount(() => {
      clearVideoFileObjectUrl()
    })

    async function onFileSelect (file: File | null) {
      if (!file) { return }
      const { wave, maxMinValue, duration: convertedDuration } = await convertWave(file as File, data.audioRate.value)
      // take duration of file
      data.waveMinMaxValue.value = maxMinValue
      data.duration.value = convertedDuration
      data.waveData.value = waveSerialize(wave, maxMinValue, 25)
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
    return <VContainer class={styles['index-page']} fluid>
      <AlertDisplay />
      <VRow class={styles['input-area']}>
        <VCol>
          <FileSelect onFileSelect={this.onFileSelect} />
        </VCol>
      </VRow>
      <div class={styles['cue-area']}>
        <VRow class="tw-pb-2" justify='space-between'>
          <VCol cols="auto">
            <VBtn onClick={this.createCue} icon>
              <VIcon icon={mdiPlus}></VIcon>
            </VBtn>
          </VCol>
          <VCol cols="auto">
            <VBtn onClick={this.undo} icon disabled={!this.undoAble}>
              <VIcon icon={mdiUndo}></VIcon>
            </VBtn>
          </VCol>
          <VCol cols="auto">
            <VBtn onClick={this.redo} icon disabled={!this.redoAble}>
              <VIcon icon={mdiRedo}></VIcon>
            </VBtn>
          </VCol>
          <VCol cols="auto">
            <VBtn
              icon
              disabled={!this.cueCount}
              onClick={this.saveAsFile}
            >
              <VIcon icon={mdiFileExport}></VIcon>
            </VBtn>
          </VCol>
        </VRow>
        <CueEditArea />
      </div>
      <VideoPlayer
        class={styles['video-area']}
        v-model:currentTime={this.currentTime}
        subscript={this.allCues}
        src={this.videoFileObjectUrl || undefined}
      ></VideoPlayer>
      <div class={styles['wave-area']}>
        <VRow class="tw-flex-nowrap">
          <VCol class="tw-overflow-scroll">
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
          </VCol>
          <VCol cols="auto" class={styles['level-slider']}>
            <VSlider
              v-model={this.pixPerSec}
              direction="vertical"
              reverse
              hideDetails
              step={5}
              max={1000}
              min={10}
            />
          </VCol>
        </VRow>
      </div>
    </VContainer>
  }
})
