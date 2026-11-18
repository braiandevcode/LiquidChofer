import type { TAlign } from "../../types/TAlign"

export interface IInfoRevealProps {
  text: string
  side?: 'top' | 'bottom'
  align?: TAlign
  className?: string
}