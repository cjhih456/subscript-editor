import useCueControl from '~/components/core/cue/composables/useCueControl'
import { useCueStore } from '~/components/core/provider/SubtitleControllerProvider'
import { cn } from '~/lib/utils'

export default defineNuxtComponent({
  name: 'Cue',
  props: {
    idx: {
      type: String,
      default: ''
    }
  },
  setup ({ idx }) {
    const nuxt = useNuxtApp()
    const { get: getCue } = useCueStore()
    const element = useTemplateRef<HTMLDivElement>('cue')
    const cue = computed(() => getCue(idx))
    const { cueDisplayPosition: displayPosition } = useCueControl(idx, element)

    const style = computed(() => {
      const { width, left } = displayPosition.value
      const isTop = cue.value.linePosition === 'top'
      return {
        width: Math.max(width, 48) + 'px',
        left: left + 'px',
        borderColor: isTop ? '#2563EB' : '#EC4899',
        boxShadow: isTop
          ? '0 0 18px rgba(37, 99, 235, 0.35)'
          : '0 0 18px rgba(236, 72, 153, 0.35)'
      }
    })

    const timeLabel = computed(() => {
      const start = nuxt.$webVtt.convertSecondToTime(cue.value.startTime).slice(3, 11)
      const end = nuxt.$webVtt.convertSecondToTime(cue.value.endTime).slice(3, 11)
      return `${start} – ${end}`
    })

    return {
      cue,
      style,
      timeLabel
    }
  },
  render () {
    const isTop = this.cue.linePosition === 'top'
    return <div
      ref='cue'
      class={cn(
        'pointer-events-auto absolute top-0 flex h-11 flex-col justify-center overflow-hidden rounded-[10px] border px-2.5 py-1.5 backdrop-blur-md',
        isTop ? 'bg-[rgba(37,99,235,0.28)]' : 'bg-[rgba(236,72,153,0.28)]'
      )}
      style={this.style}
    >
      <span class="pointer-events-none truncate text-[12px] font-medium leading-tight text-foreground">
        {this.cue.text || 'Empty cue'}
      </span>
      <span class="pointer-events-none font-mono text-[10px] leading-tight text-muted-foreground">
        {this.timeLabel}
      </span>
    </div>
  }
})
