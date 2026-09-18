import { Button } from '~/components/ui/button'
import { Play, Pause, SkipBack, SkipForward, Volume2, Maximize, Minimize, VolumeOff, Volume1, Volume } from 'lucide-vue-next'
import type Player from 'video.js/dist/types/player'
import type { PropType } from 'vue'
import { Slider } from '~/components/ui/slider'

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
    },
    currentTime: {
      type: Number,
      default: 0
    }
  },
  emits: ['update:currentTime'],
  setup (props, { emit }) {
    const nuxt = useNuxtApp()

    const playIcon = computed(() => props.isPlaying ? Pause : Play)
    const togglePlayPause = () => {
      if (props.isPlaying) {
        pauseVideo()
      } else {
        startVideo()
      }
    }
    function startVideo () {
      if (!props.player) { return }
      props.player.play()
    }
    function pauseVideo () {
      if (!props.player) { return }
      props.player.pause()
    }
    function skip (delta: number) {
      if (!props.player) { return }
      props.player.currentTime((props.player.currentTime() || 0) + delta)
    }

    const volumeData = shallowRef({
      value: 0,
      mute: false
    })
    const volumeIcon = computed(() => {
      if (volumeData.value.mute) {
        return VolumeOff
      } else if (volumeData.value.value > 0.8) {
        return Volume2
      } else if (volumeData.value.value >= 0.5 && volumeData.value.value <= 0.8) {
        return Volume1
      } else {
        return volumeData.value.value ? Volume : VolumeOff
      }
    })
    function updateVolumeState () {
      if (!props.player) { return }
      volumeData.value = { value: props.player.volume() || 0, mute: props.player.muted() || false }
    }
    function toggleMute () {
      if (!props.player) { return }
      props.player.muted(!volumeData.value.mute)
      updateVolumeState()
    }

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
    const fullscreenIcon = computed(() => fullscreenData.value ? Minimize : Maximize)

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
        emit('update:currentTime', currentTime.value)
      })
    }
    watch(() => props.currentTime, (newVal, oldVal) => {
      if (newVal !== oldVal && newVal !== currentTime.value) {
        seekCurrentTime(props.currentTime)
        currentTime.value = props.currentTime
      }
    })

    const duration = ref(0)
    function updateDurationState () {
      duration.value = props.player?.duration() || 0
    }
    function formatTimeDisplay (duration: number) {
      const format = duration >= 3600 ? 'H:mm:ss' : 'mm:ss.SS'
      return nuxt.$dayjs.utc(duration * 1000).format(format)
    }

    const durationWithCurrentTime = computed(() => {
      return formatTimeDisplay(currentTime.value)
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
      skip,
      volumeData,
      volumeIcon,
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
    return <div class="pointer-events-auto absolute bottom-3 left-1/2 z-40 flex h-12 w-[min(480px,92%)] -translate-x-1/2 items-center justify-center gap-2.5 rounded-2xl border border-white/10 bg-white/6 px-3 text-foreground backdrop-blur-md">
      <Button variant="ghost" size="icon-sm" onClick={() => this.skip(-10)}>
        <SkipBack />
      </Button>
      <Button class="size-8 rounded-full bg-primary text-primary-foreground" size="icon-sm" onClick={this.togglePlayPause}>
        <this.playIcon />
      </Button>
      <Button variant="ghost" size="icon-sm" onClick={() => this.skip(10)}>
        <SkipForward />
      </Button>
      <span class="font-mono text-xs">{this.durationWithCurrentTime}</span>
      <div class="w-24">
        <Slider
          max={this.duration}
          min={0}
          step={0.01}
          modelValue={[this.currentTime]}
          onUpdate:modelValue={(value) => {
            this.seekCurrentTime(value?.[0] || 0)
          }}
        />
      </div>
      <Button variant="ghost" size="icon-sm" onClick={this.toggleMute}>
        <this.volumeIcon />
      </Button>
      <Button variant="ghost" size="icon-sm" onClick={this.toggleFullscreen}>
        <this.fullscreenIcon />
      </Button>
    </div>
  }
})
