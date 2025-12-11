import type Player from 'video.js/dist/types/player'
import { Button } from '~/components/ui/button'
import { PlayCircle } from 'lucide-vue-next'
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
    return <Button
      class={['absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-transparent shadow-none text-white', this.started ? 'hidden' : '']}
      onClick={this.clickEvent}
      variant="ghost"
      size='video-large-btn'
    >
      <PlayCircle class="size-16" size={64}  />
    </Button>
  }
})
