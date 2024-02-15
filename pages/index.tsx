import { VBtn, VCol, VContainer, VRow, VSlider } from 'vuetify/components'
import styles from '~/assets/styles/pages/index.module.sass'
import VideoPlayer from '~/components/VideoPlayer/VideoPlayer'

import AudioWave from '~/components/mixins/Video/AudioWave'
import CueArea from '~/components/mixins/Video/CueArea'

export default defineNuxtComponent({
  name: 'IndexPage',
  setup () {
    const data = reactive<{
      displayLevel: number
      videoFile?: File
      scrollValue: number
      duration: number
      currentTime: number
      displayPx: number
      videoFileSrc: string
    }>({
      displayLevel: 2,
      videoFile: undefined,
      scrollValue: 0,
      duration: 0,
      currentTime: 0,
      displayPx: 0,
      videoFileSrc: ''
    })
    const waveHeight = 25
    const timelineCanvas = ref<HTMLCanvasElement | null>()
    const waveCanvas = ref<HTMLCanvasElement | null>()
    const waveArea = ref<HTMLDivElement | null>()
    const currentCursorArea = ref<HTMLDivElement | null>()
    const currentCursor = ref<HTMLDivElement | null>()
    const displayPx = computed(() => {
      return data.displayPx
    })
    const selectedFile = computed(() => data.videoFile)
    const duration = computed({
      get () {
        return data.duration
      },
      set (v) {
        data.duration = v
      }
    })
    const currentTime = computed({
      get () {
        return data.currentTime
      },
      set (v) {
        data.currentTime = v
      }
    })
    const { pixPerSec, levelDatasMax, cueGeneratedData } = AudioWave(
      selectedFile,
      computed(() => waveCanvas.value),
      computed(() => timelineCanvas.value),
      computed(() => data.scrollValue),
      computed(() => data.displayLevel),
      displayPx,
      duration,
      waveHeight
    )
    const {
      cueList,
      cueLastEvent,
      mouseCursor,
      currentTimePosition,
      pointerStyle,
      subtitleArea,
      addCue,
      genCueEditArea,
      genCueArea
    } = CueArea(
      computed(() => waveArea.value),
      computed(() => currentCursor.value),
      computed(() => currentCursorArea.value),
      computed(() => data.scrollValue),
      pixPerSec,
      duration,
      currentTime
    )
    function fileSelect (event: Event) {
      const target = event.target as HTMLInputElement
      if (target && target.files) {
        data.videoFile = target.files[0]
        data.videoFileSrc = URL.createObjectURL(data.videoFile)
      }
    }
    function windowResizeEvent () {
      data.displayPx = waveCanvas.value?.offsetWidth || 0
    }
    watch(() => cueGeneratedData.value, (cues) => {
      if (cues && cues.length) { cues.forEach(addCue) }
    })
    onMounted(() => {
      window.addEventListener('resize', windowResizeEvent, false)
      windowResizeEvent()
    })
    onBeforeUnmount(() => {
      window.removeEventListener('resize', windowResizeEvent, false)
      if (data.videoFileSrc) {
        URL.revokeObjectURL(data.videoFileSrc)
      }
    })
    return {
      levelDatasMax,
      data,
      currentTimePosition,
      fileSelect,

      waveArea,
      waveHeight,
      waveCanvas,
      timelineCanvas,
      displayPx,
      currentCursorArea,
      currentCursor,

      cueList,
      mouseCursor,
      pointerStyle,
      cueLastEvent,
      subtitleArea,
      addCue,
      genCueEditArea,
      genCueArea
    }
  },
  render () {
    return <VContainer class={styles['index-page']} style={{
      cursor: this.pointerStyle
    }} fluid>
      <div class={styles['input-area']}>
        <input type="file" onChange={this.fileSelect}></input>
      </div>
      <div class={styles['cue-area']}>
        {this.genCueEditArea()}
        <VBtn onClick={() => this.addCue()} class={styles['cue-add-btn']}>
          Add Cue
        </VBtn>
      </div>
      <VideoPlayer
        class={styles['video-area']}
        v-model:currentTime={this.data.currentTime}
        subscript={this.cueList}
        src={this.data.videoFileSrc}
      ></VideoPlayer>
      <div class={styles['wave-area']}>
        <VRow class="tw-flex-nowrap">
          <VCol class="tw-overflow-scroll">
            <div ref={(el) => { this.waveArea = el as HTMLDivElement }}>
              <canvas
                ref={(el) => { this.timelineCanvas = el as HTMLCanvasElement }}
                class={styles['time-line-canvas']}
                height="20"
                width={this.displayPx}
                style={{
                  width: '100%',
                  height: '20px'
                }}
              />
              <canvas
                ref={(el) => { this.waveCanvas = el as HTMLCanvasElement }}
                height={this.waveHeight * 2}
                width={this.displayPx}
                style={{
                  width: '100%',
                  height: `${this.waveHeight * 2}px`
                }}
              />
              <div
                class={styles['subtitle-area']}
                style={{
                  '--display-width': `${this.subtitleArea.width}px`,
                  '--scroll-position': `-${this.subtitleArea.position}px`
                }}
              >
                {this.genCueArea()}
              </div>
              <div class={styles['wave-area-cursor']}>
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
              </div>
            </div>
          </VCol>
          <VCol cols="auto" class={styles['level-slider']}>
            <VSlider
              v-model={this.data.displayLevel}
              direction="vertical"
              hide-details
              step={1}
              max={this.levelDatasMax}
              min={0}
            />
          </VCol>
        </VRow>
      </div>
    </VContainer>
  }
})
