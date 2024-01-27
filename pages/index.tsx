// import styles from '~~/assets/styles/pages/index.module.sass'

import audioWave from '~/components/mixins/Video/AudioWave'

export default defineNuxtComponent({
  name: 'IndexPage',
  setup () {
    const data = reactive<{
      displayLevel: number,
      videoFile?: File,
      scrollValue: number
    }>({
      displayLevel: 2,
      videoFile: undefined,
      scrollValue: 0
    })
    const waveHeight = 25
    const timeline = ref<HTMLCanvasElement | null>()
    const waveCanvas = ref<HTMLCanvasElement | null>()
    const displayPx = computed(() => {
      return waveCanvas.value?.offsetWidth || 0
    })
    const selectedFile = computed(() => data.videoFile)
    const timelineComputed = computed(() => timeline.value)
    const waveCanvasComputed = computed(() => waveCanvas.value)
    audioWave(
      selectedFile,
      waveCanvasComputed,
      timelineComputed,
      toRef(data.scrollValue),
      toRef(data.displayLevel),
      displayPx,
      waveHeight
    )
    function fileSelect (event: Event) {
      const target = event.target as HTMLInputElement
      if (target && target.files) {
        data.videoFile = target.files[0]
      }
    }

    return () => <div>
      <input type="file" onChange={fileSelect}></input>
      <canvas
        ref={(el) => { timeline.value = el as HTMLCanvasElement }}
        height="20"
        width={displayPx.value}
        style={{
          width: '100%',
          height: '20px'
        }}
      />
      <canvas
        ref={(el) => { waveCanvas.value = el as HTMLCanvasElement }}
        height={waveHeight * 2}
        width={displayPx.value}
        style={{
          width: '100%',
          height: `${waveHeight * 2}px`
        }}
      ></canvas>
    </div>
  }
})
