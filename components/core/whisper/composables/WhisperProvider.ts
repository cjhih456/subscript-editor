import type { DeepReadonly } from "vue"
import type { CueDataInterface } from '~/components/core/cue/composables/useCueStore'
import { useHuggingFaceWhisper, type HuggingFaceWhisperStatus } from "./useHuggingFaceWhisper"
import type { Chunk } from '@huggingface/transformers'

export const WHISPER_PROVIDER = Symbol('WhisperProvider')

export interface WhisperProvider {
  transcribe: (fileBlobUrl: string, language?: string) => Promise<CueDataInterface[] | undefined>
  willUseWhisper: Ref<boolean>
  selectedLanguage: Ref<string>
  supportedLanguages: DeepReadonly<{ code: string, name: string | undefined }[]>
  status: Ref<HuggingFaceWhisperStatus>
  downloadProgress: Ref<number>
}

const languageIntl = new Intl.DisplayNames('en', { type: 'language' })

export function provideWhisperProvider () {
  const willUseWhisper = ref<boolean>(false)
  const selectedLanguage = ref<string>('en')
  const {
    init,
    status,
    downloadProgress,
    transcribe: transcribeHuggingFace,
    dispose
   } = useHuggingFaceWhisper()

  // const whisper = shallowRef<WebAI | null>(null)
  const supportedLanguages = readonly(!import.meta.client ? [] : [
    'am', 'ar', 'as', 'az', 'be', 'bg', 'bn', 'bo', 'br', 'bs',
    'ca', 'cs', 'cy', 'da', 'de', 'el', 'en', 'es', 'et', 'eu',
    'fa', 'fi', 'fo', 'fr', 'gl', 'gu', 'he', 'hi', 'hr', 'ht',
    'hu', 'id', 'is', 'it', 'ja', 'ka', 'kk', 'km', 'kn', 'ko',
    'la', 'lb', 'lo', 'lt', 'lv', 'mg', 'mi', 'mk', 'ml', 'mn',
    'mr', 'ms', 'mt', 'my', 'ne', 'nl', 'nn', 'no', 'oc', 'pa',
    'pl', 'ps', 'pt', 'ro', 'ru', 'sa', 'sd', 'si', 'sk', 'sl',
    'sn', 'so', 'sq', 'sr', 'sv', 'sw', 'ta', 'te', 'tg', 'th',
    'tk', 'tl', 'tr', 'uk', 'ur', 'uz', 'vi', 'yi', 'yo', 'zh'
  ].map((code: string) => {
    return {
      code,
      name: languageIntl.of(code)
    }
  }))

  function convertResultAsVtt(result: Chunk[]) {
    if (!result || result.length === 0) {
      return []
    }

    const MAX_GAP_SECONDS = 1.0 // 단어 간 간격이 1초 이상이면 새 문장으로 구분
    const SENTENCE_ENDINGS = /[.!?。！？]\s*$/

    return result.reduce<CueDataInterface[]>((acc, chunk, index) => {
      const currentStartTime = chunk.timestamp[0]
      const currentEndTime = chunk.timestamp[1]
      const currentText = chunk.text.trim()

      if (index === 0) {
        // 첫 번째 단어로 새 문장 시작
        acc.push({
          startTime: currentStartTime,
          endTime: currentEndTime,
          text: currentText
        })
        return acc
      }

      const lastCue = acc[acc.length - 1]
      if (!lastCue) {
        // 이론적으로 발생하지 않지만 타입 안전성을 위해 체크
        acc.push({
          startTime: currentStartTime,
          endTime: currentEndTime,
          text: currentText
        })
        return acc
      }

      const timeGap = currentStartTime - lastCue.endTime
      const lastTextEndsWithPunctuation = SENTENCE_ENDINGS.test(lastCue.text)

      // 새 문장으로 구분하는 조건:
      // 1. 시간 간격이 MAX_GAP_SECONDS 이상인 경우
      // 2. 이전 텍스트가 문장 부호로 끝나는 경우
      if (timeGap >= MAX_GAP_SECONDS || lastTextEndsWithPunctuation) {
        acc.push({
          startTime: currentStartTime,
          endTime: currentEndTime,
          text: currentText
        })
      } else {
        // 현재 단어를 마지막 문장에 추가
        lastCue.endTime = currentEndTime
        lastCue.text = `${lastCue.text} ${currentText}`
      }

      return acc
    }, [])
  }

  async function transcribe(fileBlobUrl: string, language: string = 'en') {
    await init()
    const chunks: Chunk[] = await transcribeHuggingFace(fileBlobUrl, language)
    dispose()
    return convertResultAsVtt(chunks)
  }

  provide<WhisperProvider>(WHISPER_PROVIDER, {
    transcribe,
    status,
    downloadProgress,
    willUseWhisper,
    selectedLanguage,
    supportedLanguages,
  })
}

export function useWhisperProvider () {
  const whisperProvider = inject<WhisperProvider>(WHISPER_PROVIDER)
  if (!whisperProvider) {
    throw new Error('WhisperProvider is not injected')
  }
  return whisperProvider
}