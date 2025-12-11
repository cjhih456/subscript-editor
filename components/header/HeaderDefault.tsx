import { Switch } from "../ui/switch"
import { Moon, Sun } from 'lucide-vue-next'

export default defineNuxtComponent({
  name: 'HeaderDefault',
  setup () {
    const colorMode = useColorMode()
    const theme = computed({
      get() {
        return colorMode.value !== 'dark'
      },
      set(value: boolean) {
        colorMode.preference = value ? 'light' : 'dark'
      }
    })
    return {
      theme
    }
  },
  render () {
    return <div class="py-2 bg-sidebar-accent flex justify-between px-4">
      <h3 class="font-bold text-xl">Subtitle Editor</h3>
      <div>
        <Switch v-model={this.theme}>
          {{
            thumb: () => <div class="flex items-center justify-center w-full h-full">
              {this.theme ? <Sun size={16} /> : <Moon size={16} />}
            </div>
          }}
        </Switch>
      </div>
    </div>
  }
})
