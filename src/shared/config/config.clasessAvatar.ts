import type { TSize } from "../types/TSize"

// PALETA DE COLORES DE FONDO PARA EL AVATAR
export const AVATAR_PALETTE: string[] = [
  'bg-accent-violet',
  'bg-accent-green',
  'bg-accent-blue',
  'bg-accent-red',
]

export const AVATAR_SIZE_CLASSES: Record<TSize, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
}