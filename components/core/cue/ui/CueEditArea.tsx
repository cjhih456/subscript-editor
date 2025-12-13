import { Button, ClientOnly } from '#components'
import { Accordion } from '~/components/ui/accordion'
import CueEdit from '~/components/core/cue/ui/CueEdit'
import { useCueStore } from '~/components/core/provider/SubtitleControllerProvider'
import { Plus, Undo, Redo } from 'lucide-vue-next'
import { cn } from '~/lib/utils'
import { ButtonGroup } from '~/components/ui/button-group'

export default defineNuxtComponent({
  name: 'CueEditArea',
  props: {
    class: {
      type: String,
      default: ''
    }
  },
  setup () {
    const { create: createCue, allIds, undo, redo, undoAble, redoAble } = useCueStore()

    return {
      allIds,
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
          <Button onClick={this.createCue} size="icon" class="rounded-full">
            <Plus />
          </Button>
          <ButtonGroup class="rounded-full">
            <Button onClick={this.undo} disabled={!this.undoAble} size="icon">
              <Undo />
            </Button>
            <Button onClick={this.redo} disabled={!this.redoAble} size="icon">
              <Redo />
            </Button>
          </ButtonGroup>
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
