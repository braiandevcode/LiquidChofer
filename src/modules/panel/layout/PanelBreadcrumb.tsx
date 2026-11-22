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
        className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-lg border border-border-subtle bg-bg-card/60 px-3 font-display text-xs font-semibold text-accent-violet-soft transition-colors hover:border-accent-violet/40 hover:bg-bg-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-violet/50"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Ir a panel
      </Link>
    </nav>
  )
}

export default PanelBreadcrumb
