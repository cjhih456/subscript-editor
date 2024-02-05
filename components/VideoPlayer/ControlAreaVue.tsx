import { VBtn, VIcon, VSlider } from 'vuetify/components'
import { mdiPlay, mdiPause, mdiStop, mdiVolumeMute, mdiVolumeHigh, mdiVolumeLow, mdiVolumeMedium, mdiVolumeVariantOff, mdiFullscreen, mdiFullscreenExit } from '@mdi/js'
import type Player from 'video.js/dist/types/player'
import type { PropType } from 'vue'
import styleModule from '@/assets/styles/components/VideoPlayer/VideoPlayer.module.sass'
export default defineNuxtComponent({
  name: 'ControlAreaVue',
  props: {
    video: {
      type: Object as PropType<Player>,
      default: undefined
    },
    isPlaying: {
      type: Boolean,
      default: false
    },
    started: {
      type: Boolean,
      default: false
    },
    userActive: {
      type: Boolean,
      default: false
    }
  },
  setup (props) {
    const nuxt = useNuxtApp()

    // Play & Pause
    const playIcon = computed(() => props.isPlaying ? mdiPause : mdiPlay)
    const togglePlayPause = () => {
      if (props.isPlaying) {
        pauseVideo()
      } else {
        startVideo()
      }
    }
    function startVideo () {
      if (!props.video) { return }
      // starting the video...
      props.video.play()
    }
    function pauseVideo () {
      if (!props.video) { return }
      // pausing the video...
      props.video.pause()
    }
    function stopVideo () {
      if (!props.video) { return }
      // stopping the video...
      props.video.pause()
      props.video.currentTime(0)
      props.video.trigger('stop')
    }

    // Volume
    const volumeData = shallowRef({
      value: 0,
      mute: false
    })
    const volumeIcon = computed(() => {
      if (volumeData.value.mute) {
        return mdiVolumeMute
      } else if (volumeData.value.value > 0.8) {
        return mdiVolumeHigh
      } else if (volumeData.value.value >= 0.5 && volumeData.value.value <= 0.8) {
        return mdiVolumeMedium
      } else {
        return volumeData.value.value ? mdiVolumeLow : mdiVolumeVariantOff
      }
    })
    function updateVolumeState () {
      if (!props.video) { return }
      volumeData.value = { value: props.video.volume() || 0, mute: props.video.muted() || false }
    }
    function changeVolume (value: number) {
      if (!props.video) { return }
      props.video.volume(value)
      updateVolumeState()
    }
    function toggleMute () {
      if (!props.video) { return }
      props.video.muted(!volumeData.value.mute)
      updateVolumeState()
    }

    // FullScreen
    const fullscreenData = ref(false)
    function updateFullscreenState () {
      if (!props.video) { return }
      fullscreenData.value = props.video.isFullscreen() || false
    }
    function toggleFullscreen () {
      if (!props.video) { return }
      if (props.video.supportsFullScreen() && document.fullscreenEnabled) {
        if (fullscreenData.value) {
          props.video.exitFullscreen()
        } else {
          props.video.requestFullscreen()
        }
      }
    }
    const fullscreenIcon = computed(() => fullscreenData.value ? mdiFullscreenExit : mdiFullscreen)

    // CurrentTime
    const currentTime = ref(0)
    function seekCurrentTime (value: number) {
      if (value !== currentTime.value) { props.video?.currentTime(value) }
    }
    function updateCurrentTimeState () {
      requestAnimationFrame(() => {
        if (props.video?.ended()) {
          currentTime.value = duration.value
        } else {
          currentTime.value = props.video?.scrubbing() ? props.video?.getCache().currentTime : props.video?.currentTime() || 0
        }
      })
    }

    // Duration
    const duration = ref(0)
    function updateDurationState () {
      duration.value = props.video?.duration() || 0
    }
    function formatTimeDisplay (duration: number) {
      const format = duration >= 3600 ? 'H:mm:ss' : 'm:ss'
      return nuxt.$dayjs.utc(duration * 1000).format(format)
    }

    const durationWithCurrentTime = computed(() => {
      return formatTimeDisplay(duration.value) + ' / ' + formatTimeDisplay(currentTime.value)
    })

    function init () {
      updateVolumeState()
      updateFullscreenState()
      updateDurationState()
      updateCurrentTimeState()
    }

    function eventInit () {
      props.video?.on('loadedmetadata', updateDurationState)
      props.video?.on('fullscreenchange', updateFullscreenState)
      props.video?.on(['timeupdate', 'ended'], updateCurrentTimeState)
    }
    function eventDetech () {
      props.video?.off('loadedmetadata', updateDurationState)
      props.video?.off('fullscreenchange', updateFullscreenState)
      props.video?.off(['timeupdate', 'ended'], updateCurrentTimeState)
    }

    onMounted(() => {
      init()
      eventInit()
    })
    onBeforeUnmount(() => {
      eventDetech()
    })

    return {
      playIcon,
      togglePlayPause,
      stopVideo,
      volumeData,
      volumeIcon,
      changeVolume,
      toggleMute,
      fullscreenData,
      fullscreenIcon,
      toggleFullscreen,
      formatTimeDisplay,
      duration,
      currentTime,
      seekCurrentTime,
      durationWithCurrentTime,
      style: readonly(styleModule)
    }
  },
  render () {
    return <div class={[this.style['control-bar'], 'tw-bg-gray-500', 'tw-opacity-60']}>
      <div class="tw-flex">
        <VBtn size="x-small" icon onClick={this.togglePlayPause}>
          <VIcon icon={this.playIcon}></VIcon>
        </VBtn>
        <VBtn size="x-small" icon onClick={this.stopVideo}>
          <VIcon icon={mdiStop}></VIcon>{/* stop btn */}
        </VBtn>
        <span>{this.durationWithCurrentTime}</span>
        <VSlider class="tw-flex-grow" step={0} max={this.duration} modelValue={this.currentTime} onUpdate:modelValue={this.seekCurrentTime}></VSlider>
        <div class="tw-inline-block">
          <VBtn size="x-small" icon onClick={this.toggleMute}>
            <VIcon icon={this.volumeIcon}></VIcon>
          </VBtn>
        </div>
        <VBtn size="x-small" icon onClick={this.toggleFullscreen}>
          <VIcon icon={this.fullscreenIcon}></VIcon>
        </VBtn>
      </div>
    </div>
  }
})
