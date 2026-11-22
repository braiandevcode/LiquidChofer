import { House, CircleHelp, Info } from 'lucide-react'
import type { NavLinks } from '../types/header'

export const navLinks: NavLinks[] = [
  { to: '/', label: 'Inicio', icon: House },
  { to: '/preguntas', label: 'Preguntas', icon: CircleHelp },
  { to: '/acerca', label: 'Acerca de', icon: Info },
]
