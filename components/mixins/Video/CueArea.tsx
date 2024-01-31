import type { WritableComputedRef } from 'vue'

export default function CueArea (
  waveArea: ComputedRef<HTMLDivElement | null | undefined>,
  currentCursor: ComputedRef<HTMLDivElement | null | undefined>,
  currentCursorArea: ComputedRef<HTMLDivElement | null | undefined>,
  lazyScroll: ComputedRef<number>,
  pixPerSec: ComputedRef<number>,
  duration: WritableComputedRef<number>,
  currentTime: WritableComputedRef<number>
) {
  function secToPix (sec: number) {
    return pixPerSec.value * sec
  }
  function pixToSec (pix: number) {
    return pix / pixPerSec.value
  }
  class CueData {
    idx: number
    startTime: number
    endTime: number
    text: string
    get startPosition () {
      return secToPix(this.startTime)
    }

    get endPosition () {
      return secToPix(this.endTime)
    }

    get width () {
      return this.endPosition - this.startPosition
    }

    constructor () {
      this.idx = 0
      this.startTime = 0
      this.endTime = 0
      this.text = ''
    }
  }

  const eventListeningList = ['mousemove', 'mousedown', 'mouseup']
  const data = reactive<{
    cueData: CueData[]
    cursorDisplay: string
    lastMouseEvent: string
    selectedCue: number | undefined
  }>({
    cueData: [],
    cursorDisplay: 'auto',
    lastMouseEvent: '',
    selectedCue: undefined
  })
  const mouseCursor = shallowRef({
    position: 0,
    opacity: 0
  })
  const subtitleArea = computed(() => {
    return {
      width: secToPix(duration.value),
      position: secToPix(lazyScroll.value)
    }
  })
  const currentTimePosition = computed(() => {
    return secToPix(currentTime.value - lazyScroll.value)
  })
  const waveAreaPosition = computed(() => {
    const rects = waveArea.value?.getClientRects() || []
    return Array.from(rects).reduce((acc, cur) => {
      return acc > cur.left ? acc : cur.left
    }, 0)
  })
  function cursorDragEvent (e: MouseEvent) {
    mouseCursor.value = {
      position: e.x - waveAreaPosition.value,
      opacity: 0
    }
    // this.lastCue = undefined
    data.cursorDisplay = 'col-resize'
    switch (e.type) {
      case 'mousedown':
        data.lastMouseEvent = 'cursor'
        break
      case 'mousemove':
        if (data.lastMouseEvent === 'cursor') {
          currentTime.value = pixToSec(mouseCursor.value.position) + lazyScroll.value
        }
        break
      case 'mouseup':
        data.lastMouseEvent = ''
        currentTime.value = pixToSec(mouseCursor.value.position) + lazyScroll.value
        break
    }
  }
  function cueDragEvent (_e: MouseEvent, _targetEl?: Element) {
    data.lastMouseEvent = 'cursor'
  }
  function pointerEvent (e: MouseEvent) {
    data.cursorDisplay = 'auto'
    if (e.type === 'mousemove') {
      // TODO: 마우스 커서 위치에 따라 place holder 바 위치 갱신
      mouseCursor.value = {
        position: e.x - waveAreaPosition.value,
        opacity: 1
      }
    } else if (e.type === 'mouseup' || e.type === 'mousedown') {
      // TODO: 커서 드래그 이벤트와 동일하게 처리(currentTime 갱신, 마우스 포인터 변경, 등)
      cursorDragEvent(e)
    }
  }
  function waveAreaMouseEvent (e: Event) {
    requestAnimationFrame(() => {
      const mouseEvent = e as MouseEvent
      // TODO: 수행중 이던 이밴트가 있는 경우 해당 이밴트 우선처리
      if (data.lastMouseEvent === 'cursor') {
        return cursorDragEvent(mouseEvent)
      } else if (data.lastMouseEvent?.startsWith('cue-')) {
        return cueDragEvent(mouseEvent)
      }
      // TODO: take elements form cursor position
      const target = document.elementsFromPoint(mouseEvent.x, mouseEvent.y).find((el) => {
        switch (el) {
          case currentCursor.value:
          case currentCursorArea.value:
          case waveArea.value:
            return true
          default:
            return el.classList.contains('cue-bar')
        }
      })

      switch (target) {
        case waveArea.value:
          // TODO: 1. waveArea 에 마우스커서가 있는 경우 > mouse Cursor position 변화
          return pointerEvent(mouseEvent)
        // TODO: 2. cursor 에 마우스커서가 있는 경우 > 마우스의 모양을 col-resize로 전환한다. cursorDragEvent 이밴트 수행
        // TODO: 2-1. cursor-area(currentTime) 에 마우스커서가 있는 경우 > cursor가 있는 경우 type 2를 수행한다.
        case currentCursor.value:
        case currentCursorArea.value:
          return cursorDragEvent(mouseEvent)
        default:
          // TODO: 3. cue에 커서가 있는 경우 > cueDragEvent이밴트 수행
          if (target) {
            cueDragEvent(mouseEvent, target)
          } else {
            mouseCursor.value = {
              position: mouseEvent.x - waveAreaPosition.value,
              opacity: 0
            }
          }
      }
    })
  }
  onMounted(() => {
    eventListeningList.forEach((es) => {
      document.documentElement.addEventListener(
        es,
        waveAreaMouseEvent,
        false
      )
    })
  })
  onBeforeUnmount(() => {
    eventListeningList.forEach((es) => {
      document.documentElement.removeEventListener(
        es,
        waveAreaMouseEvent,
        false
      )
    })
  })
  function genCue (cue: CueData) {
    return <div
      class="cue-bar tw-bg-gray-300"
      data-id={cue.idx}
      style={{
        '--cue-position': `${cue.startPosition}px`,
        '--cue-display-width': `${cue.width}px`
      }}
    >
      <span>
        <pre>{cue.text}</pre>
      </span>
    </div>
  }
  function genCueArea () {
    return data.cueData.map(v => genCue(v))
  }
  function addCue () {
    const cueData = new CueData()
    data.cueData.push(cueData)
  }
  // function genCueEdit (cue: CueData) {
  //   return <div class="cue-bar">
  //     <span>
  //       <pre>{cue.speech}</pre>
  //     </span>
  //   </div>
  // }
  // function genCueEditArea () {
  //   return data.cueData.map(genCueEdit)
  // }
  return {
    mouseCursor: computed(() => mouseCursor.value),
    currentTimePosition,
    cueList: data.cueData,
    pointerStyle: computed(() => data.cursorDisplay),
    subtitleArea,
    addCue,
    genCueArea
  }
}
