import { VExpansionPanels } from 'vuetify/components'
import { ClientOnly } from '#components'
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
      <VExpansionPanels variant='accordion'>
        {this.allIds.map(id => <CueEdit key={id} idx={id} />)}
      </VExpansionPanels>
    </ClientOnly>
  }
})
