import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogTitle, AlertDialogTrigger } from "~/components/ui/alert-dialog"

export default defineNuxtComponent({
  name: 'AlertDialog',
  props: {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String
    },
    onConfirm: {
      type: Function,
    },
    onCancel: {
      type: Function,
      required: true,
    },
  },
  render () {
    return <AlertDialog>
      <AlertDialogTrigger asChild>
        {this.$slots.trigger?.()}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>{this.title}</AlertDialogTitle>
        <AlertDialogDescription>{
          this.$slots.description?.() ||
          this.description
        }</AlertDialogDescription>
        <AlertDialogFooter>
          {
            this.onConfirm && <AlertDialogAction onClick={() => this.onConfirm?.()}>
              Confirm
            </AlertDialogAction>
          }
          <AlertDialogCancel onClick={() => this.onCancel()}>
            Cancel
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  }
})