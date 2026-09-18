import { ClientOnly } from '#components'
import { useCueStore, useSelectedCueId } from '~/components/core/provider/SubtitleControllerProvider'
import TimeInput from '~/components/core/cue/ui/TimeInput'
import { Button } from '~/components/ui/button'
import { InputGroup, InputGroupTextarea } from '~/components/ui/input-group'
import type { CueLinePosition } from '~/plugins/WebVttPlugin'
import { ArrowDown, ArrowUp } from 'lucide-vue-next'
import { cn } from '~/lib/utils'

export default defineNuxtComponent({
  name: 'LumenInspector',
  setup () {
    const selectedCueId = useSelectedCueId()
    const { get: getCue, update: updateCue } = useCueStore()

    const cue = computed(() => {
      if (!selectedCueId.value) { return null }
      try {
        return getCue(selectedCueId.value)
      } catch {
        return null
      }
    })

    function patch (partial: Partial<{ startTime: number, endTime: number, text: string, linePosition: CueLinePosition }>) {
      if (!selectedCueId.value || !cue.value) { return }
      updateCue(selectedCueId.value, { ...cue.value, ...partial })
    }

    const title = computed(() => {
      if (!selectedCueId.value) { return 'No cue' }
      const index = selectedCueId.value.slice(0, 4)
      return `Caption ${index}`
    })

    return { selectedCueId, cue, patch, title }
  },
  render () {
    return <ClientOnly>
      <aside class="flex h-full w-full flex-col gap-3.5 rounded-2xl border border-border bg-sidebar p-4">
        <p class="text-[11px] font-semibold tracking-wide text-primary">+  SELECTED CUE</p>
        <h2 class="text-xl font-bold">{this.title}</h2>
        {this.cue
          ? <div class="overflow-y-scroll flex h-full flex-col gap-3.5 -mx-3 px-3">
            <div class="flex gap-2">
              <div class="flex min-w-0 flex-1 flex-col gap-1">
                <span class="text-[10px] font-semibold text-muted-foreground">IN</span>
                <TimeInput
                  v-model={this.cue.startTime}
                  onChange={(value: number) => this.patch({ startTime: value })}
                />
              </div>
              <div class="flex min-w-0 flex-1 flex-col gap-1">
                <span class="text-[10px] font-semibold text-muted-foreground">OUT</span>
                <TimeInput
                  v-model={this.cue.endTime}
                  onChange={(value: number) => this.patch({ endTime: value })}
                />
              </div>
            </div>
            <InputGroup class="min-h-[120px] rounded-xl border border-border bg-card">
              <InputGroupTextarea
                modelValue={this.cue.text}
                onUpdate:modelValue={(value: string) => this.patch({ text: value })}
              />
            </InputGroup>
            <div class="flex flex-col gap-1.5">
              <span class="text-[10px] font-semibold text-muted-foreground">PLAYER POSITION</span>
              <div class="flex h-9 gap-1 rounded-[10px] border border-border bg-card p-0.5">
                <Button
                  variant="ghost"
                  class={cn('h-full flex-1 rounded-lg', this.cue.linePosition === 'top' && 'bg-primary/20 text-primary')}
                  onClick={() => this.patch({ linePosition: 'top' })}
                >
                  <ArrowUp class="size-3" />
                  Top
                </Button>
                <Button
                  variant="ghost"
                  class={cn('h-full flex-1 rounded-lg', this.cue.linePosition !== 'top' && 'bg-primary/20 text-primary')}
                  onClick={() => this.patch({ linePosition: 'bottom' })}
                >
                  <ArrowDown class="size-3" />
                  Bottom
                </Button>
              </div>
            </div>
            <p class="text-xs text-muted-foreground">
              Top / Bottom only. Caption snaps to the video plane; bottom sits above the control dock.
            </p>
          </div>
          : <p class="text-sm text-muted-foreground">Select a cue in the rail to edit WTT line position.</p>}
      </aside>
    </ClientOnly>
  }
})
