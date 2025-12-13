import { useCueStore } from '~/components/core/provider/SubtitleControllerProvider'

export default function useSaveCue() {
  const nuxt = useNuxtApp()
  const { allIds, get: getCue } = useCueStore()

  const saveAble = computed(() => allIds.value.length > 0)

  const saveCue = () => {
    const allCues = allIds.value.map(id => getCue(id))
    const allText = nuxt.$webVtt.convertJsonToFile(allCues)
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
    saveAble,
    saveCue
  }
}