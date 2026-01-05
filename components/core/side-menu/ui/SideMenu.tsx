import { ClientOnly, Switch } from "#components"
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "~/components/ui/sheet"
import { Button } from "~/components/ui/button"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "~/components/ui/select"
import useVideoFileSelect from "../composables/useVideoFileSelect"
import useSaveCue from "../composables/useSaveCue"
import { MenuIcon, Moon, Sun } from "lucide-vue-next"
import useSubtitleFileSelect from "../composables/useSubtitleFileSelect"
import { useCueStore } from "../../provider/SubtitleControllerProvider"
import AlertDialog from "../../alert/ui/AlertDialog"
import { useWhisperProvider } from "../../whisper"

export default defineNuxtComponent({
  name: 'SideMenu',
  setup () {
    const sideMenuState = ref<boolean>(true)
    const { loadCues } = useCueStore()
    const { open: openVideoFileSelect } = useVideoFileSelect()
    const { open: openSubtitleFileSelect } = useSubtitleFileSelect({ onSuccess: (cues) => {
      loadCues(cues)
    } })
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

    function openSubtitleFileSelectAction() {
      openSubtitleFileSelect()
      sideMenuState.value = false
    }

    function openVideoFileSelectorAction() {
      openVideoFileSelect()
      sideMenuState.value = false
    }

    function saveCueAction() {
      saveCue()
      sideMenuState.value = false
    }

    const { willUseWhisper, selectedLanguage, supportedLanguages } = useWhisperProvider()

    return {
      openVideoFileSelectorAction,
      openSubtitleFileSelectAction,
      sideMenuState,
      willUseWhisper,
      selectedLanguage,
      supportedLanguages,
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
            {this.saveAble ? (<AlertDialog
              title="Subtitle File Select Warning"
              onConfirm={() => this.openSubtitleFileSelectAction()}
              onCancel={() => {}}
            >
              {{
                description: () => (
                  <p>
                    This action can be reset, which means what you edited in the subtitle editor will be lost.<br />
                    Are you sure you want to select a subtitle file?
                  </p>
                ),
                trigger: () => (<Button>
                  Open Subtitle File
                </Button>)
              }}
            </AlertDialog>) : <Button onClick={() => this.openSubtitleFileSelectAction()}>
              Open Subtitle File
            </Button>}
            
            <Button onClick={() => this.saveCueAction()} disabled={!this.saveAble}>
              Export Cues as VTT
            </Button>
            <div class="flex items-center justify-between text-foreground">
              <p>Whisper AI</p>
              <Switch v-model={this.willUseWhisper} />
            </div>
            {this.willUseWhisper ? (
              <div class="flex items-center justify-between text-foreground">
                <p>Language</p>
                <Select v-model={this.selectedLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                  <SelectContent>
                    {this.supportedLanguages.map((language) => (
                      <SelectItem value={language.code}>
                        {language.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </ClientOnly>
  }
})