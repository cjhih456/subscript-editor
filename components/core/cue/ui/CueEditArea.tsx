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
      <Accordion>
        {this.allIds.map(id => <CueEdit key={id} idx={id} />)}
      </Accordion>
    </ClientOnly>
  }
})
