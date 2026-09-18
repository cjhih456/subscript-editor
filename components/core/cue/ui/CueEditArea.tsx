import { Button, ClientOnly } from '#components'
import { useCueStore, useSelectedCueId } from '~/components/core/provider/SubtitleControllerProvider'
import { Plus, Undo, Redo, Trash } from 'lucide-vue-next'
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
    const nuxt = useNuxtApp()
    const { create: createCue, store, undo, redo, undoAble, redoAble, get: getCue, remove: removeCue } = useCueStore()
    const selectedCueId = useSelectedCueId()

    const sortedKeys = computed(() => {
      return Array.from(store.value.entries()).sort((a, b) => a[1].startTime - b[1].startTime).map(([idx]) => idx)
    })

    function addCue () {
      createCue()
      const ids = Array.from(store.value.keys())
      const last = ids[ids.length - 1]
      if (last) { selectedCueId.value = last }
    }

    function selectCue (id: string) {
      selectedCueId.value = id
    }

    function deleteCue (id: string) {
      if (selectedCueId.value === id) {
        selectedCueId.value = null
      }
      removeCue(id)
    }

    return {
      sortedKeys,
      createCue,
      undo,
      redo,
      undoAble,
      redoAble,
      selectedCueId,
      getCue,
      selectCue,
      deleteCue,
      addCue,
      formatTime: (sec: number) => nuxt.$webVtt.convertSecondToTime(sec).slice(3, 11)
    }
  },
  render () {
    return <ClientOnly>
      <div class={cn('flex h-full flex-col gap-2.5 rounded-2xl border border-white/8 bg-[#0B0F19] p-3', this.class)}>
        <div class="flex items-center justify-between">
          <p class="text-[11px] font-semibold tracking-wide text-muted-foreground">CUES</p>
          <ButtonGroup>
            <Button onClick={this.addCue} size="icon-sm" variant="ghost">
              <Plus />
            </Button>
            <Button onClick={this.undo} disabled={!this.undoAble} size="icon-sm" variant="ghost">
              <Undo />
            </Button>
            <Button onClick={this.redo} disabled={!this.redoAble} size="icon-sm" variant="ghost">
              <Redo />
            </Button>
          </ButtonGroup>
        </div>
        <div class="min-h-0 flex-1 overflow-y-auto pr-1">
          <div class="flex flex-col gap-2">
            {this.sortedKeys.map((id) => {
              const cue = this.getCue(id)
              const selected = this.selectedCueId === id
              return <div
                key={id}
                class={cn(
                  'flex w-full items-center gap-2.5 rounded-xl border px-3 py-2',
                  selected ? 'border-primary bg-card' : 'border-white/8 bg-card/80'
                )}
              >
                <button
                  type="button"
                  class="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                  onClick={() => this.selectCue(id)}
                >
                  <span class={cn('h-8 w-1 rounded-full', cue.linePosition === 'top' ? 'bg-accent' : 'bg-primary', !selected && 'bg-muted')} />
                  <span class="min-w-0 flex-1">
                    <span class="block font-mono text-[11px] text-muted-foreground">
                      {this.formatTime(cue.startTime)} — {this.formatTime(cue.endTime)}
                    </span>
                    <span class="block truncate text-[13px] font-medium">{cue.text || 'Empty cue'}</span>
                  </span>
                </button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  class="size-7 shrink-0 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Delete cue"
                  onClick={(event: MouseEvent) => {
                    event.stopPropagation()
                    this.deleteCue(id)
                  }}
                >
                  <Trash class="size-3.5" />
                </Button>
              </div>
            })}
          </div>
        </div>
      </div>
    </ClientOnly>
  }
})
