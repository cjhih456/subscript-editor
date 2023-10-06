import ClickOutside from '../mixins/ClickOutside'
import styles from '~~/assets/styles/components/dialog/CDialog.module.sass'
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
        [styles['fixed-content']]: slots.fixed,
        [styles['full-cover']]: slots.fullCover
      }
    })
    const divWithClickOutsideDirective = withDirectives(h('div'), [
      [ClickOutside, {
        handler: clickOutsideEvnet,
        closeConditional,
        include: () => []
      }]
    ])

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
      console.log('clickOutsideEvnet', lazyValueComputed.value)
      if (lazyValueComputed.value) { lazyValueComputed.value = false }
    }
    function activatorClickEvent (e: Event) {
      console.log(e)
      lazyValueComputed.value = !lazyValueComputed.value
    }
    return () => <div class={dialogShellClassComputed.value}>
    {data.mountedPoint
      ? <teleport to="#dialog-area" disabled={attacheComputed.value}>
      <transition>
        {lazyValueComputed.value
          ? <divWithClickOutsideDirective class={dialogContentClassComputed.value}>
          {slots.default ? slots.default() : undefined}
        </divWithClickOutsideDirective>
          : undefined}
      </transition>
    </teleport>
      : undefined}

    {
      slots.activator ? slots.activator({ clickAction: activatorClickEvent }) : 'no Activator'
    }
  </div>
  }
})
