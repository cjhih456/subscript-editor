import videojs from 'video.js'
import type Player from 'video.js/dist/types/player'
import { Teleport, type PropType } from 'vue'
import type { CueDataInterface } from '~/components/core/cue/composables/useCueStore'
import ControlArea from './ControlArea'
import BigPlayButton from './BigPlayButton'
import type { TranslateResult } from '~/plugins/WebVttPlugin'
import { cn } from '~/lib/utils'
import style from '~/assets/styles/components/VideoPlayer/index.module.css'
import 'video.js/dist/video-js.css'
import { ClientOnly } from '#components'
import StageIdleScene from '~/components/core/stage/StageIdleScene.vue'

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
    const hasVideo = computed(() => Boolean(props.src))
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

    function videoPlayerTriggerTextTrackChange () {
      if (!videoPlayer.value) { return }
      videoPlayer.value.trigger({ type: 'texttrackchange' })
    }
    watch(() => props.src, (newValue) => {
      const currentSrc = videoPlayer.value?.currentSrc()
      if (!currentSrc || newValue !== currentSrc || !currentSrc.endsWith(newValue)) {
        status.started = false
        status.isPlaying = false
        status.userActive = false
        if (newValue) {
          videoPlayer.value?.src({ type: 'video/mp4', src: newValue })
        }
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
        textTrack.value.mode = 'hidden'
        videoPlayerTriggerTextTrackChange()
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
            fill: true,
            autoplay: false,
            preload: 'metadata',
            playsinline: true,
            inactivityTimeout: 1000,
            html5: {
              nativeTextTracks: false
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
            if (textTrack.value) {
              textTrack.value.mode = 'hidden'
            }
            videoPlayer.value.trigger({ type: 'loadedmetadata', target: textTrack.value })
            videoPlayer.value.on(['timeupdate'], videoPlayerTriggerTextTrackChange)
            videoPlayer.value.on(['useractive', 'userinactive'], updateUserActiveState)
            videoPlayer.value.on(
              ['play', 'pause', 'ended', 'seeked'],
              updatePlayingState
            )
            videoPlayer.value.on(['loadstart', 'play', 'firstplay'], updateStartedState)
          })
        }
      }, 30)
    })
    onBeforeUnmount(() => {
      if (!videoPlayer.value) { return }
      videoPlayer.value.off(['timeupdate'], videoPlayerTriggerTextTrackChange)
      videoPlayer.value.off(['useractive', 'userinactive'], updateUserActiveState)
      videoPlayer.value.off(
        ['play', 'pause', 'ended', 'seeked'],
        updatePlayingState
      )
      videoPlayer.value.off(['loadstart', 'play', 'firstplay'], updateStartedState)
      videoPlayer.value.dispose()
    })

    const currentTime = computed({
      get () {
        return props.currentTime
      },
      set (v: number) {
        emit('update:currentTime', v)
      }
    })

    const activeCaptions = computed(() => {
      const t = currentTime.value
      const top = props.subscript.find(cue => cue.linePosition === 'top' && t >= cue.startTime && t < cue.endTime)
      const bottom = props.subscript.find(cue => cue.linePosition !== 'top' && t >= cue.startTime && t < cue.endTime)
      return { top, bottom }
    })

    return { videoPlayer, videoPlayerReady, status, currentTime, hasVideo, activeCaptions }
  },
  render () {
    return <div class="h-full min-h-0 w-full">
      <ClientOnly>
        <div class="relative h-full w-full overflow-hidden rounded-[20px] border border-border bg-background">
        <div class="pointer-events-none absolute inset-0 z-1">
          <StageIdleScene />
        </div>
        <div
          class={cn(
            'absolute inset-0 transition-opacity',
            this.hasVideo ? 'z-20 opacity-100' : 'z-0 opacity-0 pointer-events-none'
          )}
        >
        <video ref="video" class={cn('video-js vjs-fill bg-transparent!', style['video-player'])}></video>
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
        <div class="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-between px-6 py-4">
          {this.activeCaptions.top
            ? <div class="rounded-lg bg-black/60 px-3.5 py-2 text-center text-sm font-semibold text-white backdrop-blur-md md:text-xl">
              {this.activeCaptions.top.text}
            </div>
            : <div />}
          {this.activeCaptions.bottom
            ? <div class="mb-14 rounded-lg bg-black/60 px-3.5 py-2 text-center text-sm font-semibold text-white backdrop-blur-md md:text-xl">
              {this.activeCaptions.bottom.text}
            </div>
            : <div class="mb-14" />}
        </div>
        {!this.hasVideo
          ? <div class="pointer-events-none absolute inset-0 z-4 flex flex-col items-center justify-center gap-2 text-center">
            <p class="font-mono text-[11px] font-semibold tracking-wide text-muted-foreground">TresJS canvas · idle effects</p>
            <p class="text-sm text-foreground">Video not selected — canvas stays in front</p>
          </div>
          : null}
        </div>
      </ClientOnly>
    </div>
  }
})
