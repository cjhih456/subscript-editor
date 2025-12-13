import { ClientOnly, Switch } from "#components"
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "~/components/ui/sheet"
import { Button } from "~/components/ui/button"
import useVideoFileSelect from "../composables/useVideoFileSelect"
import useSaveCue from "../composables/useSaveCue"
import { MenuIcon, Moon, Sun } from "lucide-vue-next"

export default defineNuxtComponent({
  name: 'SideMenu',
  setup () {
    const sideMenuState = ref<boolean>(true)
    const { open: openVideoFileSelect } = useVideoFileSelect()
    const { saveCue, saveAble } = useSaveCue()

    const colorMode = useColorMode()
    const theme = computed({
      get() {
        return colorMode.value !== 'dark'
      },
      set(value: boolean) {
        colorMode.preference = value ? 'light' : 'dark'
      }
    })
    function toggleTheme() {
      theme.value = !theme.value
    }

    function openVideoFileSelectorAction() {
      openVideoFileSelect()
      sideMenuState.value = false
    }

    function saveCueAction() {
      saveCue()
      sideMenuState.value = false
    }

    return {
      openVideoFileSelectorAction,
      sideMenuState,
      saveAble,
      saveCueAction,
      toggleTheme,
      theme
    }
  },
  render () {
    return <ClientOnly>
      <Sheet v-model:open={this.sideMenuState}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <MenuIcon />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              Menu
            </SheetTitle>
          </SheetHeader>
          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between text-foreground">
              <p>Theme</p>
              <Switch v-model={this.theme}>
                {{
                  thumb: () => <div class="flex items-center justify-center w-full h-full">
                    {this.theme ? <Sun size={16} /> : <Moon size={16} />}
                  </div>
                }}
              </Switch>
            </div>
            <Button onClick={() => this.openVideoFileSelectorAction()}>
              Open Video File
            </Button>
            <Button onClick={() => this.saveCueAction()} disabled={!this.saveAble}>
              Export Cues as VTT
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </ClientOnly>
  }
})