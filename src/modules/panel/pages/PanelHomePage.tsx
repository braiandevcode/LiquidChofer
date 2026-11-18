import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Calculator, History, Settings, Sparkles, type LucideIcon } from 'lucide-react'
import { useAuth } from '../../../core/context/AuthContext'
import UserAvatar from '../../../shared/components/UserAvatar'

interface IPanelShortcut {
  to: string
  label: string
  description: string
  icon: LucideIcon
}

const SHORTCUTS: IPanelShortcut[] = [
  { to: '/panel/calculadora', label: 'Calcular', description: 'Cargá una jornada nueva', icon: Calculator },
  { to: '/panel/historial', label: 'Historial', description: 'Revisá tus jornadas', icon: History },
  { to: '/panel/ia', label: 'ChófIA', description: 'Pedile ayuda al copiloto', icon: Sparkles },
  { to: '/panel/ajustes', label: 'Ajustes', description: 'Configurá tu cuenta', icon: Settings },
]

const PanelHomePage = (): ReactNode => {
  const { user } = useAuth()
  const firstName: string = user?.displayName?.split(' ')[0] ?? 'chofer'

  return (
    <div className="mx-auto max-w-4xl px-1 animate-fade-in-up">
      <section className="card-glass rounded-2xl p-6 md:p-8">
        <div className="flex items-center gap-4">
          {user && <UserAvatar user={user} size="lg" />}
          <div className="min-w-0">
            <p className="font-display text-xs font-semibold uppercase tracking-widest text-text-muted">
              Tu panel
            </p>
            <h1 className="mt-1 font-display text-2xl font-black text-text-primary md:text-3xl">
              Hola, {firstName}
            </h1>
            <p className="mt-1 text-sm text-text-secondary">Elegí qué querés hacer hoy.</p>
          </div>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2" aria-label="Accesos rápidos">
        {SHORTCUTS.map(({ to, label, description, icon: Icon }): ReactNode => (
          <Link
            key={to}
            to={to}
            className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-border-subtle bg-bg-card p-4 transition-colors hover:border-accent-violet/40 hover:bg-bg-hover"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-violet/15 text-accent-violet-soft">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-base font-bold text-text-primary">{label}</span>
              <span className="block text-xs text-text-secondary">{description}</span>
            </span>
            <ArrowRight
              className="h-4 w-4 shrink-0 text-text-muted transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        ))}
      </section>
    </div>
  )
}

export default PanelHomePage
