import type { AutomaticSpeechRecognitionPipeline, Chunk } from '@huggingface/transformers'
import { pipeline } from '@huggingface/transformers'

export enum HuggingFaceWhisperStatus {
  BEFORE_INIT = 'before_init',
  IDLE = 'idle',
  DOWNLOADING = 'downloading',
  PROCESSING = 'processing',
}

export function useHuggingFaceWhisper () {
  const pipelineRef = shallowRef<AutomaticSpeechRecognitionPipeline | null>(null)
  const status = ref<HuggingFaceWhisperStatus>(HuggingFaceWhisperStatus.BEFORE_INIT)
  const downloadProgress = ref<number>(0)

  async function init() {
    // @ts-expect-error - navigator.gpu is not allowed major browsers
    const isGpuSupported = await navigator.gpu?.requestAdapter() ?? null

    if (!pipelineRef.value) {
      pipelineRef.value = await pipeline<'automatic-speech-recognition'>('automatic-speech-recognition', 'Xenova/whisper-tiny', {
        device: isGpuSupported ? 'webgpu' : 'wasm',
        dtype: 'fp16',
        progress_callback: (progressInfo) => {
          if(progressInfo.status === 'progress') {
            status.value = HuggingFaceWhisperStatus.DOWNLOADING
            downloadProgress.value = progressInfo.progress
          }
        }
      });
    }
    status.value = HuggingFaceWhisperStatus.IDLE
  }

  async function transcribe (fileBlobUrl: string, language: string = 'en') {
    const output = await pipelineRef.value?.(fileBlobUrl, {
      return_timestamps: 'word',
      chunk_length_s: 30,
      stride_length_s: 5,
      language,
      task: 'transcribe',
    });
    const chunks: Chunk[] = Array.isArray(output) 
    ? output.reduce((acc, cur) => {
      acc.push(...(cur.chunks || []))
      return acc
    }, [] as Chunk[]).flat() : (output?.chunks || [])

    return chunks;
  }

  async function dispose() {
    if(!pipelineRef.value) { return }
    pipelineRef.value.dispose()
    pipelineRef.value = null
  }

  onBeforeUnmount(() => {
    dispose()
  })

  return {
    transcribe,
    status,
    downloadProgress,
    init,
    dispose
  }
}