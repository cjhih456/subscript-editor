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
  timestamps?: {
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
    'am', 'ar', 'as', 'az', 'be', 'bg', 'bn', 'bo', 'br', 'bs', 'ca', 'cs', 'cy', 'da', 'de', 'el', 'en', 'es', 'et', 'eu', 'fa', 'fi', 'fo', 'fr', 'gl', 'gu', 'he', 'hi', 'hr', 'ht', 'hu', 'id', 'is', 'it', 'ja', 'ka', 'kk', 'km', 'kn', 'ko', 'la', 'lb', 'lo', 'lt', 'lv', 'mg', 'mi', 'mk', 'ml', 'mn', 'mr', 'ms', 'mt', 'my', 'ne', 'nl', 'nn', 'no', 'oc', 'pa', 'pl', 'ps', 'pt', 'ro', 'ru', 'sa', 'sd', 'si', 'sk', 'sl', 'sn', 'so', 'sq', 'sr', 'sv', 'sw', 'ta', 'te', 'tg', 'th', 'tk', 'tl', 'tr', 'uk', 'ur', 'uz', 'vi', 'yi', 'yo', 'zh'
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
        modelProgress.value = Math.round(progress.progress * 100)
      },
      callbackThrottle: 100,
    })
  })

  function convertResultAsVtt (result: WhisperResult) {
    return result.timestamps?.map((timestamp) => {
      return {
        startTime: timestamp.timestamp[0],
        endTime: timestamp.timestamp[1],
        text: timestamp.text
      } as CueDataInterface
    })
  }

  async function transcribe (fileBlobUrl: string, language: string = 'en') {
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
        return_timestamps: true,
        condition_on_prev_tokens: true,
        num_beams: 4,
      }
    }) as WhisperResult

    return convertResultAsVtt(result)
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