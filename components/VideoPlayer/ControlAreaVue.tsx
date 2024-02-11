import { VBtn, VIcon, VSlider } from 'vuetify/components'
import { mdiPlay, mdiPause, mdiStop, mdiVolumeMute, mdiVolumeHigh, mdiVolumeLow, mdiVolumeMedium, mdiVolumeVariantOff, mdiFullscreen, mdiFullscreenExit } from '@mdi/js'
import type Player from 'video.js/dist/types/player'
import type { PropType } from 'vue'
import style from '@/assets/styles/components/VideoPlayer/VideoPlayer.module.sass'
export default defineNuxtComponent({
  name: 'ControlAreaVue',
  props: {
    player: {
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
      if (!props.player) { return }
      // starting the video...
      props.player.play()
    }
    function pauseVideo () {
      if (!props.player) { return }
      // pausing the video...
      props.player.pause()
    }
    function stopVideo () {
      if (!props.player) { return }
      // stopping the video...
      props.player.pause()
      props.player.currentTime(0)
      props.player.trigger('stop')
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
      if (!props.player) { return }
      volumeData.value = { value: props.player.volume() || 0, mute: props.player.muted() || false }
    }
    function changeVolume (value: number) {
      if (!props.player) { return }
      props.player.volume(value)
      updateVolumeState()
    }
    function toggleMute () {
      if (!props.player) { return }
      props.player.muted(!volumeData.value.mute)
      updateVolumeState()
    }

    // FullScreen
    const fullscreenData = ref(false)
    function updateFullscreenState () {
      if (!props.player) { return }
      fullscreenData.value = props.player.isFullscreen() || false
    }
    function toggleFullscreen () {
      if (!props.player) { return }
      if (props.player.supportsFullScreen() && document.fullscreenEnabled) {
        if (fullscreenData.value) {
          props.player.exitFullscreen()
        } else {
          props.player.requestFullscreen()
        }
      }
    }
    const fullscreenIcon = computed(() => fullscreenData.value ? mdiFullscreenExit : mdiFullscreen)

    // CurrentTime
    const currentTime = ref(0)
    function seekCurrentTime (value: number) {
      if (value !== currentTime.value) { props.player?.currentTime(value) }
    }
    function updateCurrentTimeState () {
      requestAnimationFrame(() => {
        if (props.player?.ended()) {
          currentTime.value = duration.value
        } else {
          currentTime.value = props.player?.scrubbing() ? props.player?.getCache().currentTime : props.player?.currentTime() || 0
        }
      })
    }

    // Duration
    const duration = ref(0)
    function updateDurationState () {
      duration.value = props.player?.duration() || 0
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
      props.player?.on('loadedmetadata', updateDurationState)
      props.player?.on('fullscreenchange', updateFullscreenState)
      props.player?.on(['timeupdate', 'ended'], updateCurrentTimeState)
    }
    function eventDetech () {
      props.player?.off('loadedmetadata', updateDurationState)
      props.player?.off('fullscreenchange', updateFullscreenState)
      props.player?.off(['timeupdate', 'ended'], updateCurrentTimeState)
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
      durationWithCurrentTime
    }
  },
  render () {
    return <div class={[style['control-bar']]}>
      <VBtn size="x-small" icon onClick={this.togglePlayPause}>
        <VIcon icon={this.playIcon}></VIcon>
      </VBtn>
      <VBtn size="x-small" icon onClick={this.stopVideo}>
        <VIcon icon={mdiStop}></VIcon>
      </VBtn>
      <span class={style['duration-area']}>{this.durationWithCurrentTime}</span>
      <VSlider
        class={style['seekbar-area']}
        step={0}
        hideDetails
        max={this.duration}
        modelValue={this.currentTime}
        onUpdate:modelValue={this.seekCurrentTime}
      ></VSlider>
      <div class={style['volume-area']}>
        <VBtn size="x-small" icon onClick={this.toggleMute}>
          <VIcon icon={this.volumeIcon}></VIcon>
        </VBtn>
      </div>
      <VBtn size="x-small" icon onClick={this.toggleFullscreen}>
        <VIcon icon={this.fullscreenIcon}></VIcon>
      </VBtn>
    </div>
  }
})
