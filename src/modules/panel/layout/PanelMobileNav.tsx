import type { ReactNode } from 'react'
import { useCallback } from 'react'
import { Link, NavLink, useNavigate, type NavigateFunction } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuth } from '../../../core/context/AuthContext'
import { useChat } from '../context/chatContextValue'
import { PANEL_NAV_ITEMS } from '../config/panel.config'
import UserAvatar from '../../../shared/components/UserAvatar'

const PanelMobileNav = (): ReactNode => {
  const { user, signOut } = useAuth()
  const { closeHistory } = useChat()
  const navigate: NavigateFunction = useNavigate()

  const HANDLE_SIGN_OUT = useCallback((): void => {
    void signOut().then(() => navigate('/', { replace: true }))
  }, [signOut, navigate])

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border-subtle bg-bg-card px-4 py-2.5 md:hidden">
        <Link to="/panel" aria-label="Ir al panel principal" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="LiquidChofer" className="h-8 w-8 rounded-lg" />
          <span className="font-display text-base font-black tracking-tight text-text-primary">
            LiquidChofer
          </span>
        </Link>
        {user && (
          <div className="flex items-center gap-1.5">
            <Link to="/panel" aria-label="Ir al panel principal" title="Ir al panel principal">
              <UserAvatar user={user} size="sm" />
            </Link>
            <button
              type="button"
              onClick={HANDLE_SIGN_OUT}
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-subtle text-text-secondary transition-colors cursor-pointer hover:border-accent-red/30 hover:text-accent-red"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </header>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border-subtle bg-bg-card px-1 py-1.5 md:hidden"
        aria-label="Navegación móvil del panel"
      >
        {PANEL_NAV_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.key}
              to={item.to}
              end={item.end}
              onClick={item.key === 'ia' ? closeHistory : undefined}
              aria-label={item.label}
              className={({ isActive }) =>
                `flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1.5 font-display text-[10px] font-semibold transition-colors cursor-pointer ${
                  isActive ? 'text-accent-violet' : 'text-text-muted hover:text-text-primary'
                }`
              }
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span className="w-full truncate text-center">{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
    </>
  )
}

export default PanelMobileNav