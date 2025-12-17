import { v4 as uuid } from 'uuid'
import type { VTTCueSlim } from '~/plugins/WebVttPlugin'
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
  idx: string
  before?: CueDataInterface
  after?: CueDataInterface
}

export interface CueStoreInterface {
  allIds: ComputedRef<string[]>
  undoAble: ComputedRef<boolean>
  redoAble: ComputedRef<boolean>
  loadCues: (cues: (VTTCue | VTTCueSlim)[]) => void
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

  const undoAble = computed(() => currentIndex.value >= 0)
  const redoAble = computed(() => currentIndex.value < historyStack.value.length - 1)

  const storeCleanAction = () => {
    cueStore.value.clear()
    cueStoreKeys.value = []
    historyStack.value = []
    currentIndex.value = -1
  }

  const storeCreateAction = (idx: string, cueData: CueDataInterface) => {
    cueStore.value.set(idx, cueData)
    cueStoreKeys.value.push(idx)
  }
  const storeUpdateAction = (idx: string, cueData: CueDataInterface) => {
    cueStore.value.set(idx, cueData)
  }
  const storeDeleteAction = (idx: string) => {
    cueStore.value.delete(idx)
    const idxIndex = cueStoreKeys.value.indexOf(idx)
    if (idxIndex === -1) { return }
    cueStoreKeys.value.splice(idxIndex, 1)
  }

  const allIds = computed(() => cueStoreKeys.value)

  function addHistory (action: 'add' | 'update' | 'delete', idx: string, { before, after }: { before?: CueDataInterface, after?: CueDataInterface }) {
    const history: HistoryData = {
      action,
      idx,
      before,
      after
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
    addHistory('add', idx, { after: cueData })
  }

  function update (idx: string, cueData: CueDataInterface) {
    const [startTime, endTime] = cleanDuration(cueData.startTime, cueData.endTime)
    const cue: CueDataInterface = {
      startTime,
      endTime,
      text: cueData.text
    }
    const before = cueStore.value.get(idx)
    storeUpdateAction(idx, cue)
    addHistory('update', idx, { before, after: cue })
  }

  function remove (idx: string) {
    const data = cueStore.value.get(idx)
    if (!data) { return }
    storeDeleteAction(idx)
    addHistory('delete', idx, { before: data })
  }

  function undo () {
    if (currentIndex.value < 0) { return }
    const history = historyStack.value[currentIndex.value--]
    if (!history) { return }
    if (history.action === 'add') {
      storeDeleteAction(history.idx)
    } else if (history.action === 'update') {
      if (!history.before) { return }
      storeUpdateAction(history.idx, history.before)
    } else if (history.action === 'delete') {
      if (!history.before) { return }
      storeCreateAction(history.idx, history.before)
    }
  }

  function redo () {
    if (currentIndex.value >= historyStack.value.length - 1) { return }
    const history = historyStack.value[++currentIndex.value]
    if (!history) { return }
    if (history.action === 'add') {
      if (!history.after) { return }
      storeCreateAction(history.idx, history.after)
    } else if (history.action === 'update') {
      if (!history.after) { return }
      storeUpdateAction(history.idx, history.after)
    } else if (history.action === 'delete') {
      storeDeleteAction(history.idx)
    }
  }

  function loadCues (cues: VTTCue[]) {
    storeCleanAction()
    cues.forEach(cue => {
      const idx = uuid()
      storeCreateAction(idx, {
        startTime: cue.startTime,
        endTime: cue.endTime,
        text: cue.text
      })
    })
  }


  return {
    allIds,
    undoAble,
    redoAble,
    loadCues,
    get,
    create,
    update,
    remove,
    undo,
    redo
  }
}
