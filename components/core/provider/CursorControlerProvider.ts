import { ref, onMounted, onBeforeUnmount, computed, provide, inject, type ComputedRef, type InjectionKey } from 'vue'

// 커서 컨트롤러에서 지원하는 요소 타입
export type CursorControlElementType = 'Cue' | 'CueEdge' | 'LayoutSpliterX' | 'LayoutSpliterY'

// 등록된 요소의 정보를 저장하는 인터페이스
interface RegisteredElement {
  id: string
  element: HTMLElement
  type: CursorControlElementType
  handler: (event: MouseEvent, element: HTMLElement, part?: 'start' | 'end' | 'middle') => void
  threshold: number // 요소 근처로 간주되는 픽셀 거리
  edgeThreshold?: number // Cue 요소의 가장자리 임계값 (픽셀)
}

// 커서 스타일 맵핑
const cursorStyleMap: Record<CursorControlElementType, string> = {
  Cue: 'move',
  CueEdge: 'col-resize',
  LayoutSpliterX: 'col-resize',
  LayoutSpliterY: 'row-resize'
}

// 커서 컨트롤러 인터페이스 정의
export interface CursorController {
  // 현재 커서 스타일
  cursorStyle: ComputedRef<string>
  // 현재 드래그 중인지 여부
  isDragging: ComputedRef<boolean>
  // 현재 드래그 중인 요소의 ID
  activeDragElementId: ComputedRef<string | null>
  // 현재 드래그 중인 요소의 부분 (가장자리 또는 중앙)
  activeDragElementPart: ComputedRef<'start' | 'end' | 'middle' | null>
  // 현재 마우스 위치
  mousePosition: ComputedRef<{ x: number, y: number }>
  // 요소 등록 및 해제 함수
  registerElement: (
    element: HTMLElement,
    type: CursorControlElementType,
    handler: (event: MouseEvent, element: HTMLElement, part?: 'start' | 'end' | 'middle') => void,
    options?: { id?: string, threshold?: number, edgeThreshold?: number }
  ) => string
  unregisterElement: (id: string) => void
}

// 의존성 주입을 위한 키 정의
export const CursorControllerKey: InjectionKey<CursorController> = Symbol('CursorController')

/**
 * 커서 컨트롤러 Provider
 * 애플리케이션에 커서 컨트롤러 기능을 제공합니다.
 */
export function provideCursorController () {
  // 등록된 요소들을 저장하는 맵
  const registeredElements = ref<Map<string, RegisteredElement>>(new Map())
  // 현재 커서 스타일
  const cursorStyle = ref<string>('auto')
  // 현재 드래그 중인 요소의 ID
  const activeDragElementId = ref<string | null>(null)
  // 마우스 위치
  const mousePosition = ref({ x: 0, y: 0 })
  // 현재 드래그 중인 요소의 부분 (가장자리 또는 중앙)
  const activeDragElementPart = ref<'start' | 'end' | 'middle' | null>(null)

  // 마우스 이벤트 핸들러
  function handleMouseMove (event: MouseEvent) {
    mousePosition.value = { x: event.clientX, y: event.clientY }

    // 드래그 중인 요소가 있으면 해당 요소의 핸들러 호출
    if (activeDragElementId.value) {
      const activeElement = registeredElements.value.get(activeDragElementId.value)
      if (activeElement) {
        activeElement.handler(event, activeElement.element, activeDragElementPart.value || undefined)
        return
      }
    }

    // 드래그 중이 아니면 마우스 위치에 따라 커서 스타일 변경
    updateCursorStyle()
  }

  function handleMouseDown (event: MouseEvent) {
    // 마우스 다운 이벤트가 발생한 요소 찾기
    const result = findNearestElement(event.clientX, event.clientY)

    if (result) {
      const { element, part } = result
      activeDragElementId.value = element.id
      activeDragElementPart.value = part || null
      element.handler(event, element.element, part)
    }
  }

  function handleMouseUp (event: MouseEvent) {
    // 드래그 중인 요소가 있으면 해당 요소의 핸들러 호출 후 드래그 종료
    if (activeDragElementId.value) {
      const activeElement = registeredElements.value.get(activeDragElementId.value)
      if (activeElement) {
        activeElement.handler(event, activeElement.element, activeDragElementPart.value || undefined)
      }
      activeDragElementId.value = null
      activeDragElementPart.value = null
    }

    // 커서 스타일 업데이트
    updateCursorStyle()
  }

  // 마우스 위치에 가장 가까운 등록된 요소와 부분(가장자리 또는 중앙) 찾기
  function findNearestElement (x: number, y: number): { element: RegisteredElement, part?: 'start' | 'end' | 'middle' } | null {
    let nearestElement: RegisteredElement | null = null
    let minDistance = Infinity
    let elementPart: 'start' | 'end' | 'middle' | undefined

    for (const element of registeredElements.value.values()) {
      const rect = element.element.getBoundingClientRect()

      // 요소와의 거리 계산
      const distance = calculateDistanceToElement(x, y, rect)

      // 임계값 내에 있고 가장 가까운 요소 선택
      if (distance <= element.threshold && distance < minDistance) {
        minDistance = distance
        nearestElement = element

        // Cue 요소인 경우 가장자리 또는 중앙 부분 구분
        if (element.type === 'Cue') {
          const edgeThreshold = element.edgeThreshold || 8
          const relativeX = x - rect.left

          if (relativeX <= edgeThreshold) {
            elementPart = 'start'
          } else if (relativeX >= rect.width - edgeThreshold) {
            elementPart = 'end'
          } else {
            elementPart = 'middle'
          }
        }
      }
    }

    if (!nearestElement) {
      return null
    }

    return { element: nearestElement, part: elementPart }
  }

  // 점과 요소 사이의 거리 계산
  function calculateDistanceToElement (x: number, y: number, rect: DOMRect): number {
    const dx = Math.max(rect.left - x, 0, x - rect.right)
    const dy = Math.max(rect.top - y, 0, y - rect.bottom)
    return Math.sqrt(dx * dx + dy * dy)
  }

  // 커서 스타일 업데이트
  function updateCursorStyle () {
    const result = findNearestElement(mousePosition.value.x, mousePosition.value.y)

    if (result) {
      const { element, part } = result

      // Cue 요소인 경우 부분에 따라 다른 커서 스타일 적용
      if (element.type === 'Cue' && part) {
        if (part === 'start' || part === 'end') {
          cursorStyle.value = cursorStyleMap.CueEdge
        } else {
          cursorStyle.value = cursorStyleMap.Cue
        }
      } else {
        cursorStyle.value = cursorStyleMap[element.type]
      }
    } else {
      cursorStyle.value = 'auto'
    }

    // 문서 전체에 커서 스타일 적용
    document.documentElement.style.cursor = cursorStyle.value
  }

  // 요소 등록 함수
  function registerElement (
    element: HTMLElement,
    type: CursorControlElementType,
    handler: (event: MouseEvent, element: HTMLElement, part?: 'start' | 'end' | 'middle') => void,
    options: { id?: string, threshold?: number, edgeThreshold?: number } = {}
  ) {
    const id = options.id || `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const threshold = options.threshold || 10
    const edgeThreshold = options.edgeThreshold || 8

    registeredElements.value.set(id, {
      id,
      element,
      type,
      handler,
      threshold,
      edgeThreshold
    })

    return id
  }

  // 요소 등록 해제 함수
  function unregisterElement (id: string) {
    registeredElements.value.delete(id)
  }

  // 컴포넌트 마운트 시 이벤트 리스너 등록
  onMounted(() => {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mouseup', handleMouseUp)
  })

  // 컴포넌트 언마운트 시 이벤트 리스너 해제
  onBeforeUnmount(() => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mousedown', handleMouseDown)
    document.removeEventListener('mouseup', handleMouseUp)

    // 커서 스타일 초기화
    document.documentElement.style.cursor = 'auto'
  })

  // 커서 컨트롤러 객체 생성
  const cursorController: CursorController = {
    // 현재 커서 스타일
    cursorStyle: computed(() => cursorStyle.value),
    // 현재 드래그 중인지 여부
    isDragging: computed(() => activeDragElementId.value !== null),
    // 현재 드래그 중인 요소의 ID
    activeDragElementId: computed(() => activeDragElementId.value),
    // 현재 드래그 중인 요소의 부분 (가장자리 또는 중앙)
    activeDragElementPart: computed(() => activeDragElementPart.value),
    // 현재 마우스 위치
    mousePosition: computed(() => mousePosition.value),
    // 요소 등록 및 해제 함수
    registerElement,
    unregisterElement
  }

  // 의존성 주입
  provide(CursorControllerKey, cursorController)

  return cursorController
}

/**
 * 커서 컨트롤러 훅
 * 커서 컨트롤러 기능을 사용하기 위한 훅입니다.
 * @returns 커서 컨트롤러 객체
 */
export function useCursorControler (): CursorController {
  const cursorController = inject<CursorController>(CursorControllerKey)

  if (!cursorController) {
    throw new Error('CursorController가 제공되지 않았습니다. provideCursorController()를 먼저 호출해야 합니다.')
  }

  return cursorController
}
