import SideMenu from "../core/side-menu/ui/SideMenu"
import { useWhisperProvider } from "../core/whisper"
import WhisperStatus from "../core/whisper/ui/WhisperStatus"

export default defineNuxtComponent({
  name: 'HeaderDefault',
  setup () {
    const { willUseWhisper } = useWhisperProvider()
    return { willUseWhisper }
  },
  render () {
    return <div class="py-2 bg-sidebar-accent flex justify-between px-4">
      <h3 class="font-bold text-xl">Subtitle Editor</h3>
      <div class="flex items-center gap-2">
        {
          this.willUseWhisper && (
            <div class="flex items-center gap-2">
              <p class="text-sm text-muted-foreground">Whisper</p>
              <WhisperStatus />
            </div>
          )
        }
        <SideMenu />
      </div>
    </div>
  }
})
