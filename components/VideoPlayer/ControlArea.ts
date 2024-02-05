import videojs from 'video.js'
import type Player from 'video.js/dist/types/player'
const BaseComponent = videojs.getComponent('Component')
class ControlBar extends BaseComponent {
  _player: Player
  ended: boolean
  started: boolean
  userActive: boolean
  isPlaying: boolean
  controlBar: any
  constructor (player: Player, options: any) {
    super(player)
    this._player = player
    this.ended = this.player().ended()
    this.started = this.player().hasStarted_
    this.userActive = this.player().userActive() || false
    this.isPlaying = !this._player.paused()
    this.updateStatus()
    this.controlBar = new Proxy({}, {
      get: (_, prop) => {
        if (prop === 'controlBar' && options.controlBar) {
          return options.controlBar
        }
      }
    })
    this.on(['useractive', 'userinactive'], this.changeUserActiveStatus)
    this.on(
      ['play', 'pause', 'ended', 'seeked'],
      this.changePlayingStatus
    )
    this.on(['loadstart', 'firstplay'], this.changeStartedStatus)
    this.on(['timeupdate', 'ended'], this.updateDuration)
    this.on('loadedmetadata', this.initStatus)
    this.on('fullscreenchange', this.handleFullscreenChange)
  }

  dispose () {
    this.off(
      ['useractive', 'userinactive'],
      this.changeUserActiveStatus
    )
    this.off(
      ['play', 'pause', 'ended', 'seeked'],
      this.changePlayingStatus
    )
    this.off(['loadstart', 'firstplay'], this.changeStartedStatus)
    this.off(['timeupdate', 'ended'], this.updateDuration)
    this.off('loadedmetadata', this.initStatus)
    this.off('fullscreenchange', this.handleFullscreenChange)
    this.controlBar &&
      typeof this.controlBar === 'function' &&
      this.controlBar.$destroy()
    super.dispose()
  }

  changeStartedStatus () {
    this.ended = this.player().ended()
    this.started = this.player().hasStarted_
    this.updateStatus()
  }

  changeUserActiveStatus () {
    this.userActive = this._player.userActive() || false
    this.updateStatus()
  }

  changePlayingStatus () {
    this.isPlaying = !this._player.paused()
    this.ended = this._player.ended()
    this.updateStatus()
  }

  get getCurrentTime () {
    if (this._player.ended()) { return this._player.duration() } else {
      return this._player.scrubbing()
        ? this._player.getCache().currentTime
        : this._player.currentTime()
    }
  }

  updateDuration () {
    if (this.controlBar && this.controlBar.$props) {
      this.controlBar.$props.duration = this._player.duration()
      this.controlBar.$props.currentTime = this.getCurrentTime
    }
  }

  initStatus () {
    this.updateDuration()
  }

  updateStatus () {
    if (this.controlBar && this.controlBar.$props) {
      this.controlBar.$props.ended = this.ended
      this.controlBar.$props.activate = this.userActive
      this.controlBar.$props.playing = this.isPlaying
      this.controlBar.$props.started = this.started
    }
  }

  handleFullscreenChange () {
    if (this.controlBar && this.controlBar.$props) {
      this.controlBar.$props.fullscreen = this._player.isFullscreen()
    }
  }
}
videojs.registerComponent('ControlBar', ControlBar)
export default ControlBar
