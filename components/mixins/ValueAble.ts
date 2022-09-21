export default (
  valueName: String | Array<String>,
  defineProps: Function,
  defineEmits?: Function
) => {
  const buffer = Array.isArray(valueName) ? valueName : [valueName]
  const emitsBuffer = buffer.map((v) => `update:${v}`)
  return {
    props: defineProps(buffer),
    emits: defineEmits ? defineEmits(emitsBuffer) : emitsBuffer,
  }
}
