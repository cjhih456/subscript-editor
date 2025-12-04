import { type ShallowRef } from 'vue'
import { usePixPerSec, useCueStore } from '../../provider/SubtitleControllerProvider'
import { useCursorController } from '~/components/core/provider/CursorControllerProvider'

/**
 * when Dragging Cue, this module will be used to control the cue data.
 */
export default function useCueControl (id: string, element: Readonly<ShallowRef<HTMLDivElement | null>>) {
  const pixPerSec = usePixPerSec()
  const { update: updateCue, get: getCue } = useCueStore()
  const cue = computed(() => getCue(id))
  const { registerElement, unregisterElement } = useCursorController()

  const cueParentScrollValues = computed(() => {
    if (!element.value?.parentElement) {
      return {
        scrollLeft: 0,
        left: 0
      }
    }
    const rect = element.value.parentElement.getBoundingClientRect()
    return {
      scrollLeft: element.value.parentElement.scrollLeft,
      left: rect.left
    }
  })

  const lazyCueData = shallowRef<{
    displayPosition?: {
      left: number,
      width: number
    }
    startPosition: number
  }>({
    displayPosition: undefined,
    startPosition: 0
  })

  function getAbsolutePosition (event: MouseEvent) {
    let position = 0
    position += cueParentScrollValues.value.scrollLeft - cueParentScrollValues.value.left
    position += event.clientX - cueParentScrollValues.value.left
    return position
  }

  function onMouseEvent (event: MouseEvent, element: HTMLElement, part?: 'start' | 'end' | 'middle') {
    if (event.type === 'mousedown') {
      onMouseDown(event, element, part)
    } else if (event.type === 'mouseup') {
      onMouseUp(event, element, part)
    } else if (event.type === 'mousemove') {
      onMouseMove(event, element, part)
    }
  }

  function onMouseDown (event: MouseEvent, _element: HTMLElement, _part?: 'start' | 'end' | 'middle') {
    // 현재 cue 데이터를 기반으로 lazyCueData 초기화
    const position = getAbsolutePosition(event)

    lazyCueData.value = {
      displayPosition: {
        left: cue.value.startTime * pixPerSec.value,
        width: (cue.value.endTime - cue.value.startTime) * pixPerSec.value
      },
      startPosition: position
    }
  }

  function onMouseUp (_event: MouseEvent, _element: HTMLElement, _part?: 'start' | 'end' | 'middle') {
    if (!lazyCueData.value.displayPosition) { return }

    // 마우스 업 시 cue 데이터 업데이트
    const displayPosition = toRaw(lazyCueData.value.displayPosition)
    const pixPerSecRaw = toRaw(pixPerSec.value)
    const newStartTime = displayPosition.left / pixPerSecRaw
    const newEndTime = (displayPosition.left + displayPosition.width) / pixPerSecRaw

    lazyCueData.value = {
      displayPosition: undefined,
      startPosition: 0
    }

    // cueStore를 사용하여 데이터 업데이트
    updateCue(id, {
      text: cue.value.text,
      startTime: newStartTime,
      endTime: newEndTime
    })
  }

  function onMouseMove (event: MouseEvent, _element: HTMLElement, part?: 'start' | 'end' | 'middle') {
    if (!lazyCueData.value.displayPosition) { return }

    const absolutePosition = getAbsolutePosition(event)
    // 마우스 이동 거리 계산
    const deltaX = absolutePosition - lazyCueData.value.startPosition

    let newLeft = lazyCueData.value.displayPosition.left
    let newWidth = lazyCueData.value.displayPosition.width

    // 부분에 따라 다른 동작 수행
    if (part === 'start') {
      // 시작 지점 조정
      newLeft += deltaX
      newWidth -= deltaX
    } else if (part === 'end') {
      // 끝 지점 조정
      newWidth += deltaX
    } else {
      newLeft += deltaX
    }
    if (newWidth > 0) {
      lazyCueData.value = {
        displayPosition: {
          left: newLeft,
          width: newWidth
        },
        startPosition: absolutePosition
      }
    }
  }

  onMounted(() => {
    if (!element.value) { return }
    registerElement(element.value, 'Cue', { handler: onMouseEvent })
  })

  onBeforeUnmount(() => {
    if (!element.value) { return }
    unregisterElement(element.value)
  })

  const cueDisplayPosition = computed(() => {
    return lazyCueData.value.displayPosition ?? {
      left: cue.value.startTime * pixPerSec.value,
      width: cue.value.endTime * pixPerSec.value - cue.value.startTime * pixPerSec.value
    }
  })

  return {
    cueDisplayPosition
  }
}
