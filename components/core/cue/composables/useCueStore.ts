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

export default function useCueStore () {
  const cueStore = ref<Map<string, CueDataInterface>>(new Map())
  const historyStack = ref<HistoryData[]>([])
  const currentIndex = ref<number>(-1)

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
    cueStore.value.set(idx, cueData)
    addHistory('add', { idx, ...cueData })
  }

  function update (idx: string, cueData: CueDataInterface) {
    const [startTime, endTime] = cleanDuration(cueData.startTime, cueData.endTime)
    cueStore.value.set(idx, cueData)
    addHistory('update', { idx, ...cueData, startTime, endTime })
  }

  function remove (idx: string) {
    const data = cueStore.value.get(idx)
    if (!data) { return }
    addHistory('delete', { idx, ...data })
    cueStore.value.delete(idx)
  }

  function undo () {
    if (currentIndex.value < 0) { return }
    const history = historyStack.value[--currentIndex.value]
    if (history.action === 'add') {
      cueStore.value.delete(history.data.idx)
    } else if (history.action === 'update') {
      cueStore.value.set(history.data.idx, history.data)
    } else if (history.action === 'delete') {
      cueStore.value.set(history.data.idx, history.data)
    }
  }

  function redo () {
    if (currentIndex.value >= historyStack.value.length - 1) { return }
    const history = historyStack.value[++currentIndex.value]
    if (history.action === 'add') {
      cueStore.value.set(history.data.idx, history.data)
    } else if (history.action === 'update') {
      cueStore.value.set(history.data.idx, history.data)
    } else if (history.action === 'delete') {
      cueStore.value.delete(history.data.idx)
    }
  }

  return {
    get,
    create,
    update,
    remove,
    undo,
    redo
  }
}
