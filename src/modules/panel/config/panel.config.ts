import { Calculator, History, House, Settings, Sparkles, Trash2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface IPanelNavItem {
  key: string
  label: string
  icon: LucideIcon
  to: string
  end?: boolean
}

export const PANEL_NAV_ITEMS: IPanelNavItem[] = [
  { key: 'inicio', label: 'Panel', icon: House, to: '/panel', end: true },
  { key: 'calculator', label: 'Calculadora', icon: Calculator, to: '/panel/calculadora' },
  { key: 'historial', label: 'Historial', icon: History, to: '/panel/historial' },
  { key: 'papelera', label: 'Papelera', icon: Trash2, to: '/panel/papelera' },
  { key: 'ia', label: 'ChófIA', icon: Sparkles, to: '/panel/ia' },
  { key: 'ajustes', label: 'Ajustes', icon: Settings, to: '/panel/ajustes' },
]
