import videojs from 'video.js'

import type Player from 'video.js/dist/types/player'
import { Teleport, type PropType } from 'vue'
import type { CueDataInterface } from '~/components/core/cue/composables/useCueStore'
import ControlArea from './ControlArea'
import BigPlayButton from './BigPlayButton'
import type { TranslateResult } from '~/plugins/WebVttPlugin'
import style from '~/assets/styles/components/VideoPlayer/index.module.css'
import 'video.js/dist/video-js.css'

export default defineNuxtComponent({
  name: 'VideoPlayer',
  props: {
    src: {
      type: String,
      default: ''
    },
    currentTime: {
      type: Number,
      default: 0
    },
    subscript: {
      type: Array as PropType<CueDataInterface[]>,
      default: () => []
    }
  },
  emits: ['update:currentTime'],
  setup (props, { emit }) {
    const nuxt = useNuxtApp()
    const video = useTemplateRef<HTMLVideoElement>('video')
    const videoPlayerReady = ref<boolean>(false)
    const videoPlayer = ref<Player>()
    const textTrack = ref<TextTrack>()
    const textTrackCueList = ref<TranslateResult>()
    const status = reactive({
      started: false,
      isPlaying: false,
      userActive: false
    })
    function updateUserActiveState () {
      status.userActive = videoPlayer.value?.userActive() || false
    }
    function updatePlayingState () {
      status.isPlaying = !videoPlayer.value?.paused() || false
    }
    function updateStartedState () {
      status.started = videoPlayer.value?.hasStarted_ || false
    }
    watch(() => props.src, (newValue) => {
      const currentSrc = videoPlayer.value?.currentSrc()
      if (!currentSrc || newValue !== currentSrc || !currentSrc.endsWith(newValue)) {
        status.started = false
        status.isPlaying = false
        status.userActive = false
        videoPlayer.value?.src({ type: 'video/mp4', src: newValue })
      }
    })
    watch(() => props.subscript, async (newVal) => {
      if (!videoPlayer.value) { return }
      if (newVal && textTrack.value) {
        if (textTrackCueList.value?.cues.length) {
          textTrackCueList.value?.cues.forEach((cue) => {
            textTrack.value?.removeCue(cue as TextTrackCue)
          })
        }
        textTrackCueList.value = await nuxt.$webVtt.makeVttFromJson(newVal)
        textTrackCueList.value.cues.forEach((cue) => {
          textTrack.value?.addCue(cue as TextTrackCue)
        })
        textTrack.value.mode = 'showing'
        videoPlayer.value.trigger({ type: 'texttrackchange' })
      }
    }, { deep: true })
    onMounted(() => {
      setTimeout(() => {
        if (video.value) {
          videoPlayer.value = videojs(video.value, {
            controls: true,
            controlBar: false,
            topControlBar: false,
            loadingSpinner: false,
            playEffect: false,
            replay: true,
            bigPlayButton: false,
            aspectRatio: '16:9',
            autoplay: false,
            preload: 'metadata',
            playsinline: true,
            inactivityTimeout: 1000,
            tech: {
              featuresNativeTextTracks: true
            },
            userActions: {
              hotkeys (e: KeyboardEvent) {
                if (!videoPlayer.value) { return }
                if (e.which === 32) {
                  e.preventDefault()
                  if (videoPlayer.value.paused()) { videoPlayer.value.play() } else { videoPlayer.value.pause() }
                } else if (e.which === 77) {
                  e.preventDefault()
                  videoPlayer.value.muted(!videoPlayer.value.muted())
                } else if (e.which === 70) {
                  if (videoPlayer.value.supportsFullScreen()) {
                    if (videoPlayer.value.isFullscreen()) {
                      videoPlayer.value.exitFullscreen()
                    } else {
                      videoPlayer.value.requestFullscreen()
                    }
                  }
                } else if (e.which === 39) {
                  e.preventDefault()
                  videoPlayer.value.currentTime((videoPlayer.value.currentTime() || 0) + 10)
                } else if (e.which === 37) {
                  e.preventDefault()
                  videoPlayer.value.currentTime((videoPlayer.value.currentTime() || 0) - 10)
                } else if (e.which === 38) {
                  e.preventDefault()
                  if (videoPlayer.value.muted()) { videoPlayer.value.muted(false) }
                  videoPlayer.value.volume((videoPlayer.value.volume() || 0) + 0.1)
                } else if (e.which === 40) {
                  e.preventDefault()
                  if (videoPlayer.value.muted()) { videoPlayer.value.muted(false) }
                  videoPlayer.value.volume((videoPlayer.value.volume() || 0) - 0.1)
                }
              }
            }
          }, () => {
            videoPlayerReady.value = true
            if (!videoPlayer.value) { return }
            textTrack.value = videoPlayer.value.addTextTrack('subtitles', 'En', 'en')
            videoPlayer.value.trigger({ type: 'loadedmetadata', target: textTrack.value })
            videoPlayer.value.on(['timeupdate'], () => {
              videoPlayer.value?.trigger({ type: 'texttrackchange' })
            })
            videoPlayer.value.on(['useractive', 'userinactive'], updateUserActiveState)
            videoPlayer.value.on(
              ['play', 'pause', 'ended', 'seeked'],
              updatePlayingState
            )
            videoPlayer.value.on(['loadstart', 'play'], updateStartedState)
          })
        }
      }, 30)
    })
    onBeforeUnmount(() => {
      if (!videoPlayer.value) { return }
      videoPlayer.value.off(['timeupdate'], () => {
        videoPlayer.value?.trigger({ type: 'texttrackchange' })
      })
      videoPlayer.value.off(['useractive', 'userinactive'], updateUserActiveState)
      videoPlayer.value.off(
        ['play', 'pause', 'ended', 'seeked'],
        updatePlayingState
      )
      videoPlayer.value.off(['loadstart', 'firstplay'], updateStartedState)
    })

    const currentTime = computed({
      get () {
        return props.currentTime
      },
      set (v: number) {
        emit('update:currentTime', v)
      }
    })
    return { videoPlayer, videoPlayerReady, status, currentTime }
  },
  render () {
    return <div class="relative h-full w-full">
        <video ref="video" class={style['video-player']}></video>
        {this.videoPlayerReady && <Teleport to={this.videoPlayer && `#${this.videoPlayer.id_}` as string}>
          <ControlArea
            v-model:currentTime={this.currentTime}
            player={this.videoPlayer}
            isPlaying={this.status.isPlaying}
          ></ControlArea>
          <BigPlayButton
            started={this.status.started}
            player={this.videoPlayer}
          ></BigPlayButton>
        </Teleport>}
    </div>
  }
})
