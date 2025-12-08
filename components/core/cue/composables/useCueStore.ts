import { v4 as uuid } from 'uuid'

export interface CueDataInterface {
  startTime: number
  endTime: number
  text: string
}

export interface CueData extends CueDataInterface {
  idx: string
}

interface HistoryData {
  action: 'add' | 'update' | 'delete'
  data: CueData
}

export interface CueStoreInterface {
  allIds: ComputedRef<string[]>
  get: (idx: string) => CueDataInterface
  create: () => void
  update: (idx: string, cueData: CueDataInterface) => void
  remove: (idx: string) => void
  undo: () => void
  redo: () => void
}

export default function useCueStore (): CueStoreInterface {
  const cueStore = ref<Map<string, CueDataInterface>>(new Map())
  const cueStoreKeys = ref<string[]>([])
  const historyStack = ref<HistoryData[]>([])
  const currentIndex = ref<number>(-1)

  const storeCreateAction = (idx: string, cueData: CueDataInterface) => {
    cueStore.value.set(idx, cueData)
    cueStoreKeys.value.push(idx)
  }
  const storeUpdateAction = (idx: string, cueData: CueDataInterface) => {
    cueStore.value.set(idx, cueData)
  }
  const storeDeleteAction = (idx: string) => {
    cueStore.value.delete(idx)
    cueStoreKeys.value.splice(cueStoreKeys.value.indexOf(idx), 1)
  }

  const allIds = computed(() => cueStoreKeys.value)

  function addHistory (action: 'add' | 'update' | 'delete', data: CueData) {
    const history: HistoryData = {
      action,
      data
    }
    if (currentIndex.value !== historyStack.value.length - 1) {
      historyStack.value = historyStack.value.slice(0, currentIndex.value + 1)
    }
    historyStack.value.push(history)
    currentIndex.value++
  }

  function get (idx: string): CueDataInterface {
    const data = cueStore.value.get(idx)
    if (!data) {
      throw new Error(`Cue data not found: ${idx}`)
    }
    return data
  }

  function cleanDuration (num1: number, num2: number, maxDuration: number = Infinity): [number, number] {
    const [left, right] = num1 < num2 ? [num1, num2] : [num2, num1]
    return [Math.max(left, 0), Math.min(right, maxDuration)]
  }

  function create () {
    const idx = uuid()
    const cueData: CueDataInterface = {
      startTime: 0,
      endTime: 0,
      text: ''
    }
    storeCreateAction(idx, cueData)
    addHistory('add', { idx, ...cueData })
  }

  function update (idx: string, cueData: CueDataInterface) {
    const [startTime, endTime] = cleanDuration(cueData.startTime, cueData.endTime)
    const cue: CueDataInterface = {
      startTime,
      endTime,
      text: cueData.text
    }
    storeUpdateAction(idx, cue)
    addHistory('update', { idx, ...cue })
  }

  function remove (idx: string) {
    const data = cueStore.value.get(idx)
    if (!data) { return }
    storeDeleteAction(idx)
    addHistory('delete', { idx, ...data })
  }

  function undo () {
    if (currentIndex.value <= 0) { return }
    const history = historyStack.value[--currentIndex.value]
    if (!history) { return }
    if (history.action === 'add') {
      storeDeleteAction(history.data.idx)
    } else if (history.action === 'update') {
      storeUpdateAction(history.data.idx, history.data)
    } else if (history.action === 'delete') {
      storeCreateAction(history.data.idx, history.data)
    }
  }

  function redo () {
    if (currentIndex.value >= historyStack.value.length - 1) { return }
    const history = historyStack.value[++currentIndex.value]
    if (!history) { return }
    if (history.action === 'add') {
      storeCreateAction(history.data.idx, history.data)
    } else if (history.action === 'update') {
      storeUpdateAction(history.data.idx, history.data)
    } else if (history.action === 'delete') {
      storeDeleteAction(history.data.idx)
    }
  }

  return {
    allIds,
    get,
    create,
    update,
    remove,
    undo,
    redo
  }
}
