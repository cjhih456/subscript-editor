import { ClientOnly } from '#components'
import { Accordion } from '~/components/ui/accordion'
import CueEdit from '~/components/core/cue/ui/CueEdit'
import { useCueStore } from '~/components/core/provider/SubtitleControllerProvider'

export default defineNuxtComponent({
  name: 'CueEditArea',
  setup () {
    const { allIds } = useCueStore()
    return {
      allIds
    }
  },
  render () {
    return <ClientOnly>
      <div class="h-full relative w-[330px]">
        <div class="absolute top-0 left-0 w-full h-full overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          <Accordion collapsible>
            {this.allIds.map(id => <CueEdit key={id} idx={id} />)}
          </Accordion>
        </div>
      </div>
    </ClientOnly>
  }
})
