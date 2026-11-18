import type { ReactNode } from 'react'
import { useCallback, useState } from 'react'
import { Link, NavLink, useNavigate, type NavigateFunction } from 'react-router-dom'
import { LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useAuth } from '../../../core/context/AuthContext'
import { useChat } from '../context/chatContextValue'
import { PANEL_NAV_ITEMS } from '../config/panel.config'
import UserAvatar from '../../../shared/components/UserAvatar'
import { cn } from '../../../shared/lib/utils'
import ConversationSidebar from '../components/chat/ConversationSidebar'

const TEXT_COLLAPSE: string =
  'max-w-[10rem] overflow-hidden whitespace-nowrap opacity-100 transition-all duration-300'
const TEXT_COLLAPSED: string = 'min-[1200px]:max-w-0 min-[1200px]:opacity-0'

const PanelSidebar = (): ReactNode => {
  const { user, signOut } = useAuth()
  const { isChatRoute, closeHistory } = useChat()
  const navigate: NavigateFunction = useNavigate()
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false)

  const HANDLE_SIGN_OUT = useCallback((): void => {
    void signOut().then(() => navigate('/', { replace: true }))
  }, [signOut, navigate])

  const HANDLE_TOGGLE = useCallback((): void => {
    setIsCollapsed((collapsed) => !collapsed)
  }, [])

  return (
    <aside
      id="panel-sidebar"
      className={cn(
        'relative sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border-subtle bg-bg-card p-4 transition-[width] duration-300 ease-in-out md:flex',
        isCollapsed && 'min-[1200px]:w-20',
      )}
    >
      <button
        type="button"
        onClick={HANDLE_TOGGLE}
        aria-label={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
        aria-controls="panel-sidebar"
        aria-expanded={!isCollapsed}
        title={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
        className="absolute -right-3 top-1/2 z-20 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-border-subtle bg-bg-card text-text-secondary shadow-sm transition-colors cursor-pointer hover:text-accent-violet min-[1200px]:flex"
      >
        {isCollapsed ? (
          <PanelLeftOpen className="h-3.5 w-3.5" aria-hidden="true" />
        ) : (
          <PanelLeftClose className="h-3.5 w-3.5" aria-hidden="true" />
        )}
      </button>

      <div
        className={cn(
          'flex items-center gap-3 px-2 pb-5',
          isCollapsed && 'min-[1200px]:justify-center min-[1200px]:gap-0 min-[1200px]:px-0',
        )}
      >
        <img src="/logo.png" alt="LiquidChofer" className="h-10 w-10 shrink-0 rounded-xl" />
        <span
          className={cn(
            'font-display text-lg font-black tracking-tight text-text-primary',
            TEXT_COLLAPSE,
            isCollapsed && TEXT_COLLAPSED,
          )}
        >
          LiquidChofer
        </span>
      </div>

      <div className="chat-scrollbar chat-scrollbar-flush flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
        <nav className="flex flex-col gap-1" aria-label="Navegación del panel">
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
                  cn(
                    'inline-flex items-center gap-2.5 overflow-hidden rounded-xl border px-3 py-2.5 font-display text-sm font-semibold tracking-wide transition-all duration-200 cursor-pointer',
                    isActive
                      ? 'border-accent-violet/20 bg-accent-violet/15 text-accent-violet'
                      : 'border-transparent text-text-secondary hover:bg-bg-hover hover:text-text-primary',
                    isCollapsed && 'min-[1200px]:justify-center min-[1200px]:gap-0',
                  )
                }
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className={cn(TEXT_COLLAPSE, isCollapsed && TEXT_COLLAPSED)}>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        {isChatRoute && (
          <div
            className={cn(
              'grid grid-rows-[1fr] opacity-100 transition-all duration-300',
              isCollapsed &&
                'min-[1200px]:grid-rows-[0fr] min-[1200px]:opacity-0 min-[1200px]:invisible min-[1200px]:pointer-events-none',
            )}
          >
            <div className="overflow-hidden">
              <ConversationSidebar variant="panel" />
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 flex flex-col gap-2 border-t border-border-subtle pt-4">
        <Link
          to="/panel"
          aria-label="Ir al panel principal"
          title="Ir al panel principal"
          className={cn(
            'flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-bg-hover',
            isCollapsed && 'min-[1200px]:justify-center min-[1200px]:gap-0 min-[1200px]:px-0',
          )}
        >
          {user && <UserAvatar user={user} size="sm" />}
          <span
            className={cn(
              'min-w-0 truncate font-display text-sm font-semibold text-text-primary',
              TEXT_COLLAPSE,
              isCollapsed && TEXT_COLLAPSED,
            )}
          >
            {user?.displayName ?? user?.email}
          </span>
        </Link>
        <button
          type="button"
          onClick={HANDLE_SIGN_OUT}
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
          className={cn(
            'inline-flex w-full items-center gap-2.5 overflow-hidden rounded-xl px-3 py-2.5 font-display text-sm font-bold text-text-secondary transition-colors cursor-pointer hover:bg-accent-red/10 hover:text-accent-red',
            isCollapsed && 'min-[1200px]:justify-center min-[1200px]:gap-0',
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span className={cn(TEXT_COLLAPSE, isCollapsed && TEXT_COLLAPSED)}>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}

export default PanelSidebar
