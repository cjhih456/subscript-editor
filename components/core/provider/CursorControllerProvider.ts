import { ref, onMounted, onBeforeUnmount, computed, provide, inject, type ComputedRef, type InjectionKey } from 'vue'

// 커서 컨트롤러에서 지원하는 요소 타입
export type CursorControlElementType = 'Cue' | 'CueEdge' | 'LayoutSpliterX' | 'LayoutSpliterY' | 'TimelineCursor'

// 등록된 요소의 정보를 저장하는 인터페이스
interface RegisteredElement {
  id: string
  type: CursorControlElementType
  handler?: (event: MouseEvent, element: HTMLElement, part?: 'start' | 'end' | 'middle') => void
  threshold: number // 요소 근처로 간주되는 픽셀 거리
  edgeThreshold?: number // Cue 요소의 가장자리 임계값 (픽셀)
}

// 커서 스타일 맵핑
const cursorStyleMap: Record<CursorControlElementType, string> = {
  Cue: 'move',
  CueEdge: 'col-resize',
  LayoutSpliterX: 'col-resize',
  LayoutSpliterY: 'row-resize',
  TimelineCursor: 'col-resize'
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
    options?: { id?: string, threshold?: number, edgeThreshold?: number, handler?: (event: MouseEvent, element: HTMLElement, part?: 'start' | 'end' | 'middle') => void }
  ) => string
  unregisterElement: (element: HTMLElement) => void
}

// 의존성 주입을 위한 키 정의
export const CursorControllerKey: InjectionKey<CursorController> = Symbol('CursorController')

/**
 * 커서 컨트롤러 Provider
 * 애플리케이션에 커서 컨트롤러 기능을 제공합니다.
 */
export function provideCursorController (searchDepth: number = 2) {
  // 등록된 요소들을 저장하는 맵
  const registeredElements = ref<WeakMap<HTMLElement, RegisteredElement>>(new WeakMap())
  // 현재 커서 스타일
  const cursorStyle = ref<string>('auto')
  // 현재 드래그 중인 요소의 ID
  const activeDragElementId = ref<WeakRef<HTMLElement> | null>(null)
  // 마우스 위치
  const mousePosition = ref({ x: 0, y: 0 })
  // 현재 드래그 중인 요소의 부분 (가장자리 또는 중앙)
  const activeDragElementPart = ref<'start' | 'end' | 'middle' | null>(null)

  // 마우스 이벤트 핸들러
  function handleMouseMove (event: MouseEvent) {
    mousePosition.value = { x: event.clientX, y: event.clientY }

    // 드래그 중인 요소가 있으면 해당 요소의 핸들러 호출
    if (activeDragElementId.value) {
      const activeElement = activeDragElementId.value.deref()
      if (!activeElement) { return }
      const registeredElement = registeredElements.value.get(activeElement)
      if (!registeredElement) { return }
      registeredElement.handler?.(event, activeElement, activeDragElementPart.value || undefined)
    }

    // 드래그 중이 아니면 마우스 위치에 따라 커서 스타일 변경
    updateCursorStyle()
  }

  function handleMouseDown (event: MouseEvent) {
    // 마우스 다운 이벤트가 발생한 요소 찾기
    const result = findRegistedElement(event)

    if (result) {
      const { element, part } = result
      activeDragElementId.value = new WeakRef(element)
      activeDragElementPart.value = part || null
      result.registeredElement.handler?.(event, element, part)
    }
  }

  function handleMouseUp (event: MouseEvent) {
    // 드래그 중인 요소가 있으면 해당 요소의 핸들러 호출 후 드래그 종료
    if (activeDragElementId.value) {
      const activeElement = activeDragElementId.value.deref()
      if (!activeElement) { return }
      const registeredElement = registeredElements.value.get(activeElement)
      if (!registeredElement) { return }
      registeredElement.handler?.(event, activeElement, activeDragElementPart.value || undefined)
      activeDragElementId.value = null
      activeDragElementPart.value = null
    }

    // 커서 스타일 업데이트
    updateCursorStyle()
  }

  // 마우스 위치에 가장 가까운 등록된 요소와 부분(가장자리 또는 중앙) 찾기
  function findRegistedElement (event: MouseEvent): { element: HTMLElement, registeredElement: RegisteredElement, part?: 'start' | 'end' | 'middle' } | null {
    const { clientX: x, target: eventTarget } = event
    let detectedRegistedElement: RegisteredElement | null = null
    let elementPart: 'start' | 'end' | 'middle' | undefined

    let target = eventTarget as HTMLElement
    for (let i = 0; i < searchDepth; i++) {
      if (!target) { break }
      if (registeredElements.value.has(target)) {
        detectedRegistedElement = registeredElements.value.get(target) ?? null
        break
      } else {
        target = target.parentElement as HTMLElement
      }
    }

    if (!detectedRegistedElement) { return null }

    const rect = target.getBoundingClientRect()

    if (detectedRegistedElement.type === 'Cue') {
      const edgeThreshold = detectedRegistedElement.edgeThreshold || 8
      if (x <= rect.left + edgeThreshold) {
        elementPart = 'start'
      } else if (x >= rect.right - edgeThreshold) {
        elementPart = 'end'
      } else {
        elementPart = 'middle'
      }
    } else {
      elementPart = 'middle'
    }
    return { element: target, registeredElement: detectedRegistedElement, part: elementPart }
  }

  // 커서 스타일 업데이트
  function updateCursorStyle () {
    if (activeDragElementId.value) {
      const activeElement = activeDragElementId.value.deref()
      if (!activeElement) { return }
      const registeredElement = registeredElements.value.get(activeElement)
      if (!registeredElement) { return }

      // Cue 요소인 경우 부분에 따라 다른 커서 스타일 적용
      if (registeredElement.type === 'Cue' && activeDragElementPart.value) {
        if (activeDragElementPart.value === 'start' || activeDragElementPart.value === 'end') {
          cursorStyle.value = cursorStyleMap.CueEdge
        } else {
          cursorStyle.value = cursorStyleMap.Cue
        }
      } else {
        cursorStyle.value = cursorStyleMap[registeredElement.type]
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
    options: { id?: string, threshold?: number, edgeThreshold?: number, handler?: (event: MouseEvent, element: HTMLElement, part?: 'start' | 'end' | 'middle') => void } = {}
  ) {
    const id = options.id || `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const threshold = options.threshold || 10
    const edgeThreshold = options.edgeThreshold || 8

    registeredElements.value.set(element, {
      id,
      type,
      handler: options.handler,
      threshold,
      edgeThreshold
    })

    return id
  }

  // 요소 등록 해제 함수
  function unregisterElement (element: HTMLElement) {
    registeredElements.value.delete(element)
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
    activeDragElementId: computed(() => {
      if (!activeDragElementId.value) { return null }
      const activeElement = activeDragElementId.value.deref()
      if (!activeElement) { return null }
      return registeredElements.value.get(activeElement)?.id ?? null
    }),
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
export function useCursorController (): CursorController {
  const cursorController = inject<CursorController>(CursorControllerKey)

  if (!cursorController) {
    throw new Error('CursorController가 제공되지 않았습니다. provideCursorController()를 먼저 호출해야 합니다.')
  }

  return cursorController
}
