import { ref } from 'vue'

export type ToastKind = 'info' | 'success' | 'error'
export interface Toast {
  message: string
  kind: ToastKind
}

const TOAST_DURATION_MS = 3000

const current = ref<Toast | null>(null)
let dismissTimer: ReturnType<typeof setTimeout> | null = null

function notify(message: string, kind: ToastKind = 'info'): void {
  if (dismissTimer) clearTimeout(dismissTimer)
  current.value = { message, kind }
  dismissTimer = setTimeout(() => {
    current.value = null
    dismissTimer = null
  }, TOAST_DURATION_MS)
}

export function useToast() {
  return { current, notify }
}
