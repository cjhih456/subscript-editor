import { v4 as uuid } from 'uuid'
import { VCol, VRow, VTextField, VBtn, VIcon } from 'vuetify/components'

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
  const nuxt = useNuxtApp()
  function secToPix (sec: number) {
    return pixPerSec.value * sec
  }
  function pixToSec (pix: number) {
    return pix / pixPerSec.value
  }
  class CueData {
    idx: string
    startTime: number
    endTime: number
    text: string
    lazy: {
      startTime: number
      endTime: number
      startPosition: number
    }

    get startPosition () {
      return secToPix(this.lazy.startTime || this.startTime)
    }

    get endPosition () {
      return secToPix(this.lazy.endTime || this.endTime)
    }

    get width () {
      return this.endPosition - this.startPosition
    }

    get startTimeEdit () {
      return nuxt.$dayjs.duration((this.lazy.startTime || this.startTime) * 1000).format('HH:mm:ss.SSS')
    }

    set startTimeEdit (value: string) {
      this.lazy.startTime = nuxt.$webVtt.convertTimeToSecond(value)
      this.update()
    }

    get endTimeEdit () {
      return nuxt.$dayjs.duration((this.lazy.endTime || this.endTime) * 1000).format('HH:mm:ss.SSS')
    }

    set endTimeEdit (value: string) {
      this.lazy.endTime = nuxt.$webVtt.convertTimeToSecond(value)
      this.update()
    }

    constructor () {
      this.idx = uuid()
      this.startTime = 0
      this.endTime = 0
      this.text = ''
      this.lazy = {
        startTime: 0,
        endTime: 0,
        startPosition: 0
      }
    }

    update () {
      if ((this.lazy.startTime || this.startTime) <= (this.lazy.endTime || this.endTime)) {
        if (this.startTime !== this.lazy.startTime) { this.startTime = this.lazy.startTime }
        if (this.endTime !== this.lazy.endTime) { this.endTime = this.lazy.endTime }
      }
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
    display: false
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
      display: false
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
  function cueDragEvent (e: MouseEvent, targetEl?: HTMLDivElement) {
    let id: string | undefined
    if (targetEl) {
      id = targetEl?.dataset.id
    }
    if (data.lastMouseEvent.startsWith('cue-')) {
      id = data.lastMouseEvent.replace(/(^cue-|-[esm]$)/g, '')
    }
    const hoveredCueData = data.cueData.find(v => v.idx === id)
    if (!hoveredCueData) { return }
    mouseCursor.value = {
      position: e.x - waveAreaPosition.value,
      display: false
    }
    const innerPos =
      mouseCursor.value.position - (hoveredCueData.startPosition - secToPix(lazyScroll.value))
    switch (e.type) {
      case 'mousemove':
        if (!data.lastMouseEvent) {
          if (innerPos < 8 || innerPos > hoveredCueData.width - 8) {
            data.cursorDisplay = 'col-resize'
          } else {
            data.cursorDisplay = 'move'
          }
        } else {
          cueMoveEvent(hoveredCueData, false)
        }
        break
      case 'mousedown':
        if (innerPos < 8) {
          data.lastMouseEvent = `cue-${hoveredCueData.idx}-s`
        } else if (innerPos > hoveredCueData.width - 8) {
          data.lastMouseEvent = `cue-${hoveredCueData.idx}-e`
        } else {
          data.lastMouseEvent = `cue-${hoveredCueData.idx}-m`
        }
        hoveredCueData.lazy.startPosition = mouseCursor.value.position
        break
      case 'mouseup':
        cueMoveEvent(hoveredCueData, true)
        data.lastMouseEvent = ''
        break
    }
  }
  /**
   * 커서를 마우스로 드래그시 발생하는 이밴트를 처리하기 위한 함수이다.
   * @param cue 위치 변경할 CueData 객체
   * @param isUp mouseUp이벤트 케이스인 경우
   * @returns {void}
   */
  function cueMoveEvent (cue: CueData, isUp: boolean) {
    if (!data.lastMouseEvent.startsWith('cue-')) { return }
    const movement = pixToSec(mouseCursor.value.position - cue.lazy.startPosition)
    if (data.lastMouseEvent.endsWith('-s')) {
      cue.lazy.startTime = cue.startTime + movement
    } else if (data.lastMouseEvent.endsWith('-e')) {
      cue.lazy.endTime = cue.endTime + movement
    } else if (data.lastMouseEvent.endsWith('-m')) {
      cue.lazy.startTime = cue.startTime + movement
      cue.lazy.endTime = cue.endTime + movement
    }
    if (isUp) {
      cue.update()
    }
  }
  function pointerEvent (e: MouseEvent) {
    data.cursorDisplay = 'auto'
    if (e.type === 'mousemove') {
      // TODO: 마우스 커서 위치에 따라 place holder 바 위치 갱신
      mouseCursor.value = {
        position: e.x - waveAreaPosition.value,
        display: true
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
            cueDragEvent(mouseEvent, target as HTMLDivElement)
          } else {
            mouseCursor.value = {
              position: mouseEvent.x - waveAreaPosition.value,
              display: false
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
  function addCue (cue?: VTTCue) {
    const cueData = new CueData()
    if (cue) {
      cueData.startTime = cue.startTime
      cueData.endTime = cue.endTime
      cueData.text = cue.text
    }
    data.cueData.push(cueData)
  }
  function deleteCue (cue: CueData) {
    data.cueData = data.cueData.filter(v => v.idx !== cue.idx)
  }
  function genCueEdit (rowData: CueData) {
    return <VRow key={`cue${rowData.idx}`} no-gutters>
        <VCol>
          <VTextField
            v-model={rowData.startTimeEdit}
          />
        </VCol>
        <VCol>
          <VTextField
            v-model={rowData.endTimeEdit}
          />
        </VCol>
        <VCol>
          <VTextField v-model={rowData.text} />
        </VCol>
        <VCol cols="auto">
          <VBtn
            color="tw-text-red-400"
            icon
            onClick={() => {
              deleteCue(rowData)
            }}
          >
            <VIcon icon="$delete"></VIcon>
          </VBtn>
        </VCol>
      </VRow>
  }
  function genCueEditArea () {
    return data.cueData.map(genCueEdit)
  }
  return {
    mouseCursor: computed(() => mouseCursor.value),
    currentTimePosition,
    cueList: data.cueData,
    cueLastEvent: data.lastMouseEvent, // TODO: delete
    pointerStyle: computed(() => data.cursorDisplay),
    subtitleArea,
    addCue,
    deleteCue,
    genCueArea,
    genCueEditArea
  }
}
