import type { TAlign } from "../types/TAlign"

export const ALIGN_CLASSES: Record<TAlign, string> = {
  start: 'left-0',
  center: 'left-1/2 -translate-x-1/2',
  end: 'right-0',
}

export const ALIGN_POINTER_CLASSES: Record<TAlign, string> = {
  start: 'left-3',
  center: 'left-1/2 -translate-x-1/2',
  end: 'right-3',
}