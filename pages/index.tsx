import { VBtn, VCol, VContainer, VRow, VSlider } from 'vuetify/components'
import styles from '~/assets/styles/pages/index.module.sass'
import AlertDisplay from '~/components/core/alert/ui/AlertDisplay'
import VideoPlayer from '~/components/VideoPlayer/VideoPlayer'
import { provideCursorController } from '~/components/core/provider/CursorControllerProvider'
import { provideSubtitleController } from '~/components/core/provider/SubtitleControllerProvider'
import FileSelect from '~/components/core/file-select/ui/FileSelect'
import useFFmpeg from '~/components/core/file-select/composables/useFFmpeg'
import TimeBar from '~/components/core/timeline/ui/TimeBar'
import WaveBar from '~/components/core/timeline/ui/WaveBar'
import CueBar from '~/components/core/cue/ui/CueBar'

export default defineNuxtComponent({
  name: 'IndexPage',
  setup () {
    provideCursorController(3)
    const data = provideSubtitleController()
    const { create: createCue, getAllIds, getAllCues } = data.cueStore
    const cues = computed(() => getAllCues())
    const cueCount = computed(() => cues.value.length)
    const waveArea = ref<HTMLDivElement | null>(null)
    const currentCursorArea = ref<HTMLDivElement | null>()
    const currentCursor = ref<HTMLDivElement | null>()

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
      getAllIds,
      timeBarHeight,
      fontSize,
      waveHeight,
      cues,
      cueCount,
      waveArea,
      currentCursorArea,
      currentCursor,
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
        {
          // this.cues.map(cue => <CueEdit key={cue.idx} idx={cue.idx} />)
        }
        <VBtn onClick={() => this.createCue()} class={styles['cue-add-btn']}>
          Add Cue
        </VBtn>
      </div>
      <VideoPlayer
        class={styles['video-area']}
        v-model:currentTime={this.currentTime}
        subscript={this.cues}
        src={this.videoFileObjectUrl || undefined}
      ></VideoPlayer>
      <div class={styles['wave-area']}>
        <VRow class="tw-flex-nowrap">
          <VCol class="tw-overflow-scroll">
            <div class={[styles['wave-display']]} ref={(el) => { this.waveArea = el as HTMLDivElement }}>
              <TimeBar timeBarHeight={this.timeBarHeight} fontSize={this.fontSize} />
              <WaveBar waveHeight={this.waveHeight} />
              <CueBar />
              {/* {withMemo([this.mouseCursor, this.currentTimePosition], () => <div class={styles['wave-area-cursor']}>
                <div
                  class={[styles['hover-cursor'], this.mouseCursor.display ? styles.display : '']}
                  style={{
                    '--cursor-position': `${this.mouseCursor.position}px`
                  }}
                >
                  <div class={[styles.cursor]}></div>
                </div>
                <div
                  ref={(el) => { this.currentCursorArea = el as HTMLDivElement }}
                  class={[styles['cursor-area']]}
                  style={{
                    '--cursor-position': `${this.currentTimePosition}px`
                  }}
                >
                  <div
                    ref={(el) => { this.currentCursor = el as HTMLDivElement }}
                    class={[styles.cursor]}
                  ></div>
                </div>
              </div>, cache, 0)} */}
            </div>
            <VSlider v-model={this.scrollValue} hideDetails max={this.duration}></VSlider>
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
