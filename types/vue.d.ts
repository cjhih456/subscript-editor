import 'vue'
declare module 'vue' {
  interface ComponentCustomProps {
    onClick?: (e: MouseEvent) => void;
    accept?: string
  }
}
