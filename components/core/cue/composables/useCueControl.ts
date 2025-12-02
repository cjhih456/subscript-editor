import { usePixPerSec } from '../../provider/SubtitleControllerProvider'
import useCueStore from './useCueStore'
import { useCursorController } from '~/components/core/provider/CursorControllerProvider'

/**
 * when Dragging Cue, this module will be used to control the cue data.
 */
export default function useCueControl (id: string, element: Ref<HTMLElement>) {
  const pixPerSec = usePixPerSec()
  const cueStore = useCueStore()
  const { registerElement, unregisterElement } = useCursorController()

  const cue = computed(() => cueStore.get(id))

  const lazyCueData = ref<{
    displayPosition?: {
      left: number,
      width: number
    }
    startPosition: number
  }>({
    displayPosition: undefined,
    startPosition: 0
  })

  function getAbsolutePosition (event: MouseEvent, element: HTMLElement) {
    const parentElement = element.parentElement
    let position = 0
    if (parentElement) {
      position += parentElement.scrollLeft - parentElement.getBoundingClientRect().left
    }
    position += event.clientX - event.offsetX
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

  function onMouseDown (event: MouseEvent, element: HTMLElement, _part?: 'start' | 'end' | 'middle') {
    // 현재 cue 데이터를 기반으로 lazyCueData 초기화
    const position = getAbsolutePosition(event, element)

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
    const newStartTime = lazyCueData.value.displayPosition.left / pixPerSec.value
    const newEndTime = (lazyCueData.value.displayPosition.left + lazyCueData.value.displayPosition.width) / pixPerSec.value

    // cueStore를 사용하여 데이터 업데이트
    cueStore.update(id, {
      ...cue.value,
      startTime: newStartTime,
      endTime: newEndTime
    })
  }

  function onMouseMove (event: MouseEvent, element: HTMLElement, part?: 'start' | 'end' | 'middle') {
    if (!lazyCueData.value.displayPosition) { return }

    const absolutePosition = getAbsolutePosition(event, element)
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
    if (newWidth < 0) {
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
    registerElement(element.value, 'Cue', { handler: onMouseEvent })
  })

  onBeforeUnmount(() => {
    unregisterElement(element.value)
  })

  const cueDisplayPosition = computed(() => {
    if (lazyCueData.value.displayPosition) { return lazyCueData.value.displayPosition }
    return {
      left: cue.value.startTime * pixPerSec.value,
      width: cue.value.endTime * pixPerSec.value - cue.value.startTime * pixPerSec.value
    }
  })

  return {
    cueDisplayPosition
  }
}
