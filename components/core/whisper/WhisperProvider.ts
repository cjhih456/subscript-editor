import { WebAI } from "@axols/webai-js"
import type { DeepReadonly } from "vue"
import type { CueDataInterface } from '~/components/core/cue/composables/useCueStore'

export const WHISPER_PROVIDER = Symbol('WhisperProvider')

export interface WhisperProvider {
  transcribe: (fileBlobUrl: string, language?: string) => Promise<CueDataInterface[] | undefined>
  modelProgress: Ref<number>
  isReady: ComputedRef<boolean>
  willUseWhisper: Ref<boolean>
  selectedLanguage: Ref<string>
  supportedLanguages: DeepReadonly<{ code: string, name: string | undefined }[]>
}

interface WhisperResult {
  result: string
  chunks?: {
    timestamp: [number, number]
    text: string
  }[]
}

const languageIntl = new Intl.DisplayNames('en', { type: 'language' })

export function provideWhisperProvider () {
  const whisper = shallowRef<WebAI | null>(null)
  const modelProgress = ref<number>(0)
  const willUseWhisper = ref<boolean>(false)
  const selectedLanguage = ref<string>('en')
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

  const isReady = computed(() => {
    return modelProgress.value === 100
  })

  watch(willUseWhisper, async (value) => {
    if (!import.meta.client || !value || whisper.value) {
      whisper.value?.clearQueue()
      whisper.value?.clearMemory()
      whisper.value?.terminate()
      whisper.value = null
      return
    }
    whisper.value = await WebAI.create({
      modelId: 'whisper-tiny',
      dev: import.meta.env.DEV,
    })
    await whisper.value?.init({
      mode: 'auto',
      priorities: [{
        mode: 'webai',
        precision: 'fp16',
        device: 'webgpu',
      }, {
        mode: 'webai',
        precision: 'uint8',
        device: 'wasm',
      }],
      onDownloadProgress: (progress) => {
        modelProgress.value = progress.progress
        sessionStorage.setItem('whisper-model-progress', modelProgress.value.toString())
      },
      callbackThrottle: 100,
    })
    if (whisper.value.isInitialized) {
      sessionStorage.setItem('whisper-model-progress', '100')
    }
  })

  function convertResultAsVtt (result: WhisperResult) {
    if (!result.chunks || result.chunks.length === 0) {
      return []
    }

    const MAX_GAP_SECONDS = 1.0 // 단어 간 간격이 1초 이상이면 새 문장으로 구분
    const SENTENCE_ENDINGS = /[.!?。！？]\s*$/

    return result.chunks.reduce<CueDataInterface[]>((acc, chunk, index) => {
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

  async function transcribeProcess (fileBlobUrl: string, language: string = 'en') {
    const result = await whisper.value?.generate({
      userInput: {
        audio_blob_url: fileBlobUrl
      },
      generateConfig: {
        chunk_length_s: 5,
        target_sample_rate: 16000,
      },
      modelConfig: {
        language,
        task: 'transcribe',
        condition_on_prev_tokens: true,
        return_timestamps: 'word',
        num_beams: 4,
      }
    }) as WhisperResult

    return convertResultAsVtt(result)
  }

  async function transcribe(fileBlobUrl: string, language: string = 'en') {
    if(sessionStorage.getItem('whisper-model-progress') === '100') {
      return transcribeProcess(fileBlobUrl, language)
    }
    return new Promise(resolve => {
      const interval = setInterval(() => {
        if (sessionStorage.getItem('whisper-model-progress') === '100' && whisper.value?.isInitialized) {
          resolve(true)
          clearInterval(interval)
        }
      }, 100)
    }).then(() => {
      return transcribeProcess(fileBlobUrl, language)
    })
  }

  provide<WhisperProvider>(WHISPER_PROVIDER, {
    transcribe,
    modelProgress,
    isReady,
    willUseWhisper,
    selectedLanguage,
    supportedLanguages
  })
}

export function useWhisperProvider () {
  const whisperProvider = inject<WhisperProvider>(WHISPER_PROVIDER)
  if (!whisperProvider) {
    throw new Error('WhisperProvider is not injected')
  }
  return whisperProvider
}