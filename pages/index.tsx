import { VBtn, VCol, VContainer, VRow, VSlider } from 'vuetify/components'
import styles from '~/assets/styles/pages/index.module.sass'
import AlertDisplay from '~/components/core/alert/ui/AlertDisplay'
import VideoPlayer from '~/components/VideoPlayer/VideoPlayer'
import { provideCursorController } from '~/components/core/provider/CursorControllerProvider'
import { provideSubtitleController } from '~/components/core/provider/SubtitleControllerProvider'
import CueArea from '~/components/mixins/Video/CueArea'
import FileSelect from '~/components/core/file-select/ui/FileSelect'
import useFFmpeg from '~/components/core/file-select/composables/useFFmpeg'
import TimeBar from '~/components/core/timeline/ui/TimeBar'
import WaveBar from '~/components/core/timeline/ui/WaveBar'

export default defineNuxtComponent({
  name: 'IndexPage',
  setup () {
    provideCursorController()
    const data = provideSubtitleController()
    const { create: createCue } = data.cueStore
    const waveArea = ref<HTMLDivElement | null>(null)
    const currentCursorArea = ref<HTMLDivElement | null>()
    const currentCursor = ref<HTMLDivElement | null>()

    const {
      cueList,
      cueLastEvent,
      mouseCursor,
      currentTimePosition,
      pointerStyle,
      subtitleArea,
      genCueEditArea,
      genCueArea,
      saveSubscribe
    } = CueArea(
      computed(() => waveArea.value),
      computed(() => currentCursor.value),
      computed(() => currentCursorArea.value),
      computed(() => data.scrollValue.value),
      data.pixPerSec,
      data.duration,
      data.currentTime
    )

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
    return {
      ...data,
      currentTimePosition,

      waveArea,
      currentCursorArea,
      currentCursor,

      cueList,
      mouseCursor,
      pointerStyle,
      cueLastEvent,
      subtitleArea,
      onFileSelect,
      createCue,
      genCueEditArea,
      genCueArea,
      saveSubscribe
    }
  },
  render (_ctx: any, cache: unknown[]) {
    return <VContainer class={styles['index-page']} style={{
      cursor: this.pointerStyle
    }} fluid>
      <AlertDisplay />
      <VRow class={styles['input-area']}>
        <VCol>
          <FileSelect onFileSelect={this.onFileSelect} />
        </VCol>
        <VCol cols="auto">
          <VBtn onClick={this.saveSubscribe} disabled={!this.cueList.length} class={styles['cue-save-btn']}>
            Save Subscribe
          </VBtn>
        </VCol>
      </VRow>
      <div class={styles['cue-area']}>
        {this.genCueEditArea()}
        <VBtn onClick={() => this.createCue()} class={styles['cue-add-btn']}>
          Add Cue
        </VBtn>
      </div>
      <VideoPlayer
        class={styles['video-area']}
        v-model:currentTime={this.currentTime}
        subscript={this.cueList}
        src={this.videoFileObjectUrl || undefined}
      ></VideoPlayer>
      <div class={styles['wave-area']}>
        <VRow class="tw-flex-nowrap">
          <VCol class="tw-overflow-scroll">
            <div class={[styles['wave-display']]} ref={(el) => { this.waveArea = el as HTMLDivElement }}>
              <TimeBar timeBarHeight={20} fontSize={12} />
              <WaveBar waveHeight={50} />
              <div
                class={styles['subtitle-area']}
                style={{
                  '--display-width': `${this.subtitleArea.width}px`,
                  '--scroll-position': `-${this.subtitleArea.position}px`
                }}
              >
                {this.genCueArea(cache, 1)}
              </div>
              {withMemo([this.mouseCursor, this.currentTimePosition], () => <div class={styles['wave-area-cursor']}>
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
              </div>, cache, 0)}
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
