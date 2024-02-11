import type Player from 'video.js/dist/types/player'
import { VBtn, VIcon } from 'vuetify/lib/components/index.mjs'
import { mdiPlayCircleOutline } from '@mdi/js'
import style from '@/assets/styles/components/VideoPlayer/VideoPlayer.module.sass'
export default defineNuxtComponent({
  name: 'BigPlayButton',
  props: {
    started: {
      type: Boolean,
      default: false
    },
    player: {
      type: Object as PropType<Player>
    }
  },
  setup (props) {
    function clickEvent () {
      props.player?.play()
    }
    return {
      clickEvent
    }
  },
  render () {
    return <VBtn
      ripple={false}
      class={[style['big-play-btn'], this.started ? style['has-started'] : '']}
      onClick={this.clickEvent}
      icon
      size={80}
    >
      <VIcon icon={mdiPlayCircleOutline} size={64}></VIcon>
    </VBtn>
  }
})
