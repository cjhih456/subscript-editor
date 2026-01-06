import { useWhisperProvider, WhisperProcessStatus } from "../composables/WhisperProvider"
import { motion, AnimatePresence } from 'motion-v'
import { Loader, Download, Fan } from 'lucide-vue-next'

export default defineNuxtComponent({
  name: 'WhisperStatus',
  setup () {
    const { processStatus, modelProgress } = useWhisperProvider()

    const statusColor = computed(() => {
      switch (processStatus.value) {
        case WhisperProcessStatus.NOT_READY:
          return 'bg-slate-100 text-slate-500'
        case WhisperProcessStatus.DOWNLOADING:
          return 'bg-blue-50 text-blue-600'
        case WhisperProcessStatus.IDLE:
          return 'bg-emerald-50 text-emerald-600'
        case WhisperProcessStatus.PROCESSING:
          return 'bg-purple-50 text-purple-600'
        default: return ''
      }
    })

    return {
      statusColor,
      processStatus,
      modelProgress
    }
  },
  render () {
    return <div class="relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={this.processStatus}
          initial={{ scale: 0.8, opacity: 0, rotate: -20 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0.8, opacity: 0, rotate: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          class={`w-8 h-8 rounded-full flex items-center justify-center ${this.statusColor} shadow-inner`}
        >
          {/* 각 상태별 특화 애니메이션 */}
          {this.processStatus === WhisperProcessStatus.NOT_READY && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
            >
              <Loader class="w-5 h-5" />
            </motion.div>
          )}

          {this.processStatus === WhisperProcessStatus.DOWNLOADING && (
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <Download class="w-5 h-5" />
            </motion.div>
          )}

          {this.processStatus === WhisperProcessStatus.IDLE && (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Fan class="w-5 h-5" />
            </motion.div>
          )}

          {this.processStatus === WhisperProcessStatus.PROCESSING && (
            <div class="relative">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
              >
                <Fan class="w-5 h-5" />
              </motion.div>
              {/* 주변 파동 효과 */}
              {[1, 2].map((i) => (
                <motion.div
                  key={i}
                  class="absolute inset-0 border-4 border-purple-200 rounded-full"
                  initial={{ scale: 1, opacity: 0.8 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    delay: i * 0.5,
                    ease: "easeOut"
                  }}
                />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  }
})