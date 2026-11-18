import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

// SALIDA DE EMERGENCIA: DISPONIBLE EN TODA VISTA AUTENTICADA EXCEPTO EL HUB
const PanelBreadcrumb = (): ReactNode => {
  const { pathname } = useLocation()

  if (pathname === '/panel') return null

  return (
    <nav aria-label="Salida rápida" className="mb-3">
      <Link
        to="/panel"
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 font-display text-xs font-semibold text-text-secondary transition-colors hover:bg-bg-hover hover:text-accent-violet-soft"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Ir a panel
      </Link>
    </nav>
  )
}

export default PanelBreadcrumb
