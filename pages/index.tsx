import { VBtn, VCol, VContainer, VRow, VSlider } from 'vuetify/components'
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
    const data = provideSubtitleController()
    const { create: createCue, get: getCue, allIds } = data.cueStore
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
    const timeBarHeight = ref(20)
    const fontSize = ref(12)
    const waveHeight = ref(50)
    return {
      ...data,
      timeBarHeight,
      fontSize,
      waveHeight,
      allCues,
      cueCount,
      onFileSelect,
      createCue
    }
  },
  render () {
    return <VContainer class={styles['index-page']} fluid>
      <AlertDisplay />
      <VRow class={styles['input-area']}>
        <VCol>
          <FileSelect onFileSelect={this.onFileSelect} />
        </VCol>
        <VCol cols="auto">
          <VBtn disabled={!this.cueCount} class={styles['cue-save-btn']}>
            Save Subscribe
          </VBtn>
        </VCol>
      </VRow>
      <div class={styles['cue-area']}>
        <CueEditArea />
        <VBtn onClick={() => this.createCue()} class={styles['cue-add-btn']}>
          Add Cue
        </VBtn>
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
