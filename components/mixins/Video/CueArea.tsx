import { v4 as uuid } from 'uuid'
import type { WritableComputedRef } from 'vue'
import { VExpansionPanels } from 'vuetify/lib/components/index.mjs'
import { CueEdit } from '#components'

export interface CueData {
  idx: string
  startTime: number
  endTime: number
  text: string
}

/**
 * Methods and data for handling subscript data.
 * This module initializes cursor events.
 * @param waveArea - Element for the waveform directory.
 * @param currentCursor - Element for the current cursor directory.
 * @param currentCursorArea - Element containing the current cursor directory.
 * @param lazyScroll - Scrolled position.
 * @param pixPerSec - Computed value by the AudioWave module.
 * @param duration - Media's duration.
 * @param currentTime - Current time in seconds.
 */
export default function CueArea (
  waveArea: ComputedRef<HTMLDivElement | null | undefined>,
  currentCursor: ComputedRef<HTMLDivElement | null | undefined>,
  currentCursorArea: ComputedRef<HTMLDivElement | null | undefined>,
  lazyScroll: ComputedRef<number>,
  pixPerSec: ComputedRef<number>,
  duration: WritableComputedRef<number>,
  currentTime: WritableComputedRef<number>
) {
  const alertMessage = ref<string>()
  /**
   * convert second to pixel
   * @param sec second data
   * @returns pixel
   */
  function secToPix (sec: number) {
    return pixPerSec.value * sec
  }
  /**
   * convert pixel to second
   * @param pix pixel data
   * @returns second
   */
  function pixToSec (pix: number) {
    return pix / pixPerSec.value
  }
  class CueData {
    /**
     * uuid of cue
     */
    idx: string
    /**
     * cue's start time
     */
    startTime: number
    /**
     * cue's end time
     */
    endTime: number
    /**
     * cue's text data
     */
    text: string
    /**
     * Will be use on cueDragEvent function.
     * That method will be call on drag cue's start, end, middle side.
     */
    lazy: {
      startTime?: number
      endTime?: number
      startPosition: number
    }

    get startPosition () {
      return secToPix(this.lazy.startTime ?? this.startTime)
    }

    get endPosition () {
      return secToPix(this.lazy.endTime ?? this.endTime)
    }

    get width () {
      return this.endPosition - this.startPosition
    }

    constructor () {
      this.idx = uuid()
      this.startTime = 0
      this.endTime = 0
      this.text = ''
      this.lazy = {
        startTime: undefined,
        endTime: undefined,
        startPosition: 0
      }
    }

    /**
     * commit lazy data
     */
    update () {
      if ((this.lazy.startTime ?? this.startTime) <= (this.lazy.endTime ?? this.endTime)) {
        if (this.startTime !== this.lazy.startTime && this.lazy.startTime) {
          this.startTime = this.lazy.startTime
          this.lazy.startTime = undefined
        }
        if (this.endTime !== this.lazy.endTime && this.lazy.endTime) {
          this.endTime = this.lazy.endTime
          this.lazy.endTime = undefined
        }
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
  /**
   * values for cursor control.
   */
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
   * Validates and modifies the value to ensure it falls between 0 and the duration.
   * @param {number} value - The new time value to update.
   */
  function minMaxDuration (value: number) {
    return Math.max(Math.min(value, duration.value), 0)
  }
  /**
   * Function to handle events triggered by dragging the cursor with the mouse.
   * @param cue - CueData object to update the position.
   * @param isUp - Indicates if it's a mouseUp event case.
   * @returns {void}
   */
  function cueMoveEvent (cue: CueData, isUp: boolean) {
    if (!data.lastMouseEvent.startsWith('cue-')) { return }
    const movement = pixToSec(mouseCursor.value.position - cue.lazy.startPosition)
    if (data.lastMouseEvent.endsWith('-s')) {
      cue.lazy.startTime = minMaxDuration(cue.startTime + movement)
    } else if (data.lastMouseEvent.endsWith('-e')) {
      cue.lazy.endTime = minMaxDuration(cue.endTime + movement)
    } else if (data.lastMouseEvent.endsWith('-m')) {
      cue.lazy.startTime = minMaxDuration(cue.startTime + movement)
      cue.lazy.endTime = minMaxDuration(cue.endTime + movement)
    }
    if (isUp) {
      cue.update()
    }
  }
  function pointerEvent (e: MouseEvent) {
    data.cursorDisplay = 'auto'
    if (e.type === 'mousemove') {
      // TODO: Update the position of the placeholder bar based on the mouse cursor position.
      mouseCursor.value = {
        position: e.x - waveAreaPosition.value,
        display: true
      }
    } else if (e.type === 'mouseup' || e.type === 'mousedown') {
      // TODO: Handle the placeholder bar movement similarly to cursor drag events (update currentTime, change mouse pointer, etc.).
      cursorDragEvent(e)
    }
  }
  function waveAreaMouseEvent (e: Event) {
    requestAnimationFrame(() => {
      const mouseEvent = e as MouseEvent
      // TODO: If there is an ongoing event, prioritize that event.
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
        // TODO: 1. If the mouse cursor is over waveArea, change mouse cursor position.

        case waveArea.value:
          return pointerEvent(mouseEvent)
        // TODO: 2. If the mouse cursor is over the cursor, change the cursor to col-resize and perform cursorDragEvent.
        // TODO: 2-1. If the mouse cursor is over cursor-area (currentTime), perform type 2 when the cursor is present.
        case currentCursor.value:
        case currentCursorArea.value:
          return cursorDragEvent(mouseEvent)
        default:
          // TODO: 3. If the cursor is over the cue, perform cueDragEvent.
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
    if (!duration.value) {
      alertMessage.value = 'Please, select video file first'
      setTimeout(() => { alertMessage.value = undefined }, 2000)
      return
    }
    const cueData = new CueData()
    if (cue) {
      cueData.startTime = cue.startTime
      cueData.endTime = cue.endTime
      cueData.text = cue.text
    }
    data.cueData.push(cueData)
  }
  function deleteCue (idx: string) {
    data.cueData = data.cueData.filter(v => v.idx !== idx)
  }
  function genCueEdit (rowData: CueData) {
    return <CueEdit
      idx={rowData.idx}
      v-model:start={rowData.startTime}
      v-model:end={rowData.endTime}
      v-model:text={rowData.text}
      onDelete={deleteCue}
    ></CueEdit>
  }
  function genCueEditArea () {
    return <VExpansionPanels variant='accordion'>
      {data.cueData.map(genCueEdit)}
    </VExpansionPanels>
  }
  return {
    alertMessage: computed(() => alertMessage.value),
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
