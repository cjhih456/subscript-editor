import { Button, ClientOnly } from '#components'
import { Accordion } from '~/components/ui/accordion'
import CueEdit from '~/components/core/cue/ui/CueEdit'
import { useCueStore } from '~/components/core/provider/SubtitleControllerProvider'
import { Plus, Undo, Redo, Save } from 'lucide-vue-next'
import { cn } from '~/lib/utils'

export default defineNuxtComponent({
  name: 'CueEditArea',
  props: {
    class: {
      type: String,
      default: ''
    }
  },
  setup () {
    const nuxt = useNuxtApp()
    const { create: createCue, get: getCue, allIds, undo, redo, undoAble, redoAble } = useCueStore()
    const cueCount = computed(() => allIds.value.length)
    const allCues = computed(() => allIds.value.map(id => getCue(id)))

    function saveAsFile() {
      const allText = nuxt.$webVtt.convertJsonToFile(allCues.value)
      const url = URL.createObjectURL(allText)
      const a = document.createElement('a')
      a.href = url
      a.download = 'subtitle.vtt'
      a.click()
      setTimeout(() => {
        URL.revokeObjectURL(url)
      }, 1000)
    }

    return {
      allIds,
      cueCount,
      allCues,
      saveAsFile,
      createCue,
      undo,
      redo,
      undoAble,
      redoAble
    }
  },
  render () {
    return <ClientOnly>
      <div class={cn('flex flex-col gap-2', this.class)}>
        <div class="flex justify-between gap-2 pt-2">
          <Button onClick={this.createCue} class="rounded-full">
            <Plus />
          </Button>
          <Button onClick={this.undo} disabled={!this.undoAble} class="rounded-full">
            <Undo />
          </Button>
          <Button onClick={this.redo} disabled={!this.redoAble} class="rounded-full">
            <Redo />
          </Button>
          <Button onClick={this.saveAsFile} disabled={!this.allCues.length} class="rounded-full">
            <Save />
          </Button>
        </div>
        <div class="relative w-full md:min-w-[330px] grow">
          <div class="absolute top-0 left-0 w-full h-full overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <Accordion collapsible>
              {this.allIds.map(id => <CueEdit key={id} idx={id} />)}
            </Accordion>
          </div>
        </div>
      </div>
      
    </ClientOnly>
  }
})
