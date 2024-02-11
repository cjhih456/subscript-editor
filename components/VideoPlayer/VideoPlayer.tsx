import videojs from 'video.js'

import type Player from 'video.js/dist/types/player'
import { Teleport } from 'vue'
import ControlAreaVue from './ControlAreaVue'
import BigPlayButton from './BigPlayButton'
import { ClientOnly } from '#components'
import styles from '@/assets/styles/components/VideoPlayer/VideoPlayer.module.sass'

export default defineNuxtComponent({
  name: 'VideoPlayer',
  props: {
    src: {
      type: String,
      default: ''
    }
  },
  setup (props) {
    const video = ref<Element | null>()
    const videoPlayerReady = ref<boolean>(false)
    const videoPlayer = ref<Player>()
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
        videoPlayer.value?.src({ type: 'video/mp4', src: newValue })
      }
    })
    onMounted(() => {
      setTimeout(() => {
        // @ts-ignore
        window.VIDEOJS_NO_DYNAMIC_STYLE = true
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
            userActions: {
              hotkeys (e: KeyboardEvent) {
                if (!videoPlayer.value) { return }
                if (e.which === 32) {
                  e.preventDefault()
                  videoPlayer.value.paused() ? videoPlayer.value.play() : videoPlayer.value.pause()
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
            videoPlayer.value.on(['useractive', 'userinactive'], updateUserActiveState)
            videoPlayer.value.on(
              ['play', 'pause', 'ended', 'seeked'],
              updatePlayingState
            )
            videoPlayer.value.on(['loadstart', 'firstplay'], updateStartedState)
          })
        }
      }, 30)
    })
    onBeforeUnmount(() => {
      if (!videoPlayer.value) { return }
      videoPlayer.value.off(['useractive', 'userinactive'], updateUserActiveState)
      videoPlayer.value.off(
        ['play', 'pause', 'ended', 'seeked'],
        updatePlayingState
      )
      videoPlayer.value.off(['loadstart', 'firstplay'], updateStartedState)
    })
    return { video, videoPlayer, videoPlayerReady, status }
  },
  render () {
    return <div class={styles['video-player']}>
      <ClientOnly>
        <video ref={((el) => { this.video = el as Element })}></video>
        {this.videoPlayerReady && <Teleport to={this.videoPlayer && `#${this.videoPlayer.id_}` as string}>
          <ControlAreaVue
            player={this.videoPlayer}
            isPlaying={this.status.isPlaying}
          ></ControlAreaVue>
          <BigPlayButton
            player={this.videoPlayer}
          ></BigPlayButton>
        </Teleport>}
      </ClientOnly>
    </div>
  }
})
