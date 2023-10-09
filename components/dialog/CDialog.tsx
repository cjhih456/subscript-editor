import { Teleport, Transition } from 'vue'
import ClickOutside from '../mixins/ClickOutside'
import styles from '~~/assets/styles/components/dialog/CDialog.module.sass'
import { ClientOnly } from '#components'
export default defineNuxtComponent({
  props: {
    attache: { type: Boolean, default: false },
    fixed: { type: Boolean, default: false },
    fullCover: { type: Boolean, default: false },
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue'],
  setup (props, { emit, slots }) {
    const data = reactive({
      mountedPoint: false
    })
    onMounted(() => {
      nextTick(() => {
        setTimeout(() => {
          data.mountedPoint = true
        }, 30)
      })
    })
    const attacheComputed = computed(() => {
      return props.attache
    })
    const dialogShellClassComputed = computed(() => {
      return { [styles['attached-content']]: props.attache, [styles['dialog-shell']]: true }
    })
    const dialogContentClassComputed = computed(() => {
      return {
        [styles['dialog-content']]: true,
        [styles['full-cover']]: slots.fullCover
      }
    })

    const activatorComputed = computed(() => slots.activator ? slots.activator({ clickAction: activatorClickEvent }) : undefined)

    const lazyValue = ref(false)
    const lazyValueComputed = computed({
      get () {
        return lazyValue.value
      },
      set (value) {
        emit('update:modelValue', lazyValue.value = value)
      }
    })
    watch(
      () => props.modelValue,
      (newVal, oldVal) => {
        if (newVal !== oldVal) { lazyValueComputed.value = newVal }
      }
    )

    function closeConditional () {
      return lazyValueComputed.value
    }

    function clickOutsideEvnet () {
      if (lazyValueComputed.value) { lazyValueComputed.value = false }
    }
    function activatorClickEvent (_e: Event) {
      lazyValueComputed.value = !lazyValueComputed.value
    }
    return () => <div class={dialogShellClassComputed.value}>
    {data.mountedPoint
      ? <ClientOnly>
          <Teleport to="#dialog-area" disabled={attacheComputed.value}>
            <Transition>
                {
                  lazyValueComputed.value
                    ? <div class={styles['dialog-overlay']}>
                      {withDirectives(h('div', { class: dialogContentClassComputed.value }, slots.default ? slots.default() : undefined), [
                        [ClickOutside, {
                          handler: clickOutsideEvnet,
                          closeConditional,
                          include: () => [activatorComputed.value]
                        }]
                      ])}</div>
                    : undefined
                }
            </Transition>
          </Teleport>
        </ClientOnly>
      : undefined}
    {
      activatorComputed.value
    }
  </div>
  }
})
