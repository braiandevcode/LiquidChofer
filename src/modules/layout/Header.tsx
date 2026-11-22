import { Menu, X, Sun, Moon, LogIn, LogOut } from 'lucide-react'
import { useCallback, useState, useEffect, type ReactNode } from 'react'
import { Link, NavLink, useNavigate, type NavigateFunction } from 'react-router-dom'
import { navLinks } from '../../core/config/header.config'
import { useTheme } from '../../core/context/ThemeContext'
import { useAuth } from '../../core/context/AuthContext'
import UserAvatar from '../../shared/components/UserAvatar'


const Header = ():ReactNode => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)

  const CLOSE_MENU_ON_MODAL_OPEN = (): (() => void) => {
    const handler = () => setIsMenuOpen(false)
    window.addEventListener('modal:open', handler)
    return () => window.removeEventListener('modal:open', handler)
  }
  useEffect(CLOSE_MENU_ON_MODAL_OPEN, [])
  const navigate: NavigateFunction = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const { user, signOut } = useAuth()
  const ThemeIcon = theme === 'dark' ? Sun : Moon

  const handleLogoClick = () => {
    navigate('/')
    setIsMenuOpen(false)
  }

  const handleSignOut = useCallback((): void => {
    setIsMenuOpen(false)
    void signOut().then(() => navigate('/', { replace: true }))
  }, [signOut, navigate])

  const handleNavClick = useCallback((): void => {
    setIsMenuOpen(false)
  }, [])

  const handleMenuToggle = useCallback((): void => {
    setIsMenuOpen((prev) => !prev)
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-bg-card via-bg-card to-bg-card-subtle border-b border-border-subtle backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 md:px-6">
        <button
          type="button"
          onClick={handleLogoClick}
          className="flex items-center gap-3 cursor-pointer"
        >
          <img src="/logo.png" alt="LiquidChofer" className="h-11 w-11 rounded-xl" />
          <div className="flex flex-col">
            <span className="text-xl font-black text-text-primary font-display tracking-tight">
              LiquidChofer
            </span>
            <span className="text-[10px] text-text-muted font-display">
              Calculadora de jornada
            </span>
          </div>
        </button>

        <nav className="hidden md:flex items-center gap-2" aria-label="Navegación principal">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-1.5 transition-all duration-200 cursor-pointer font-display tracking-wide ${
                  isActive
                    ? 'bg-accent-violet/15 text-accent-violet border border-accent-violet/20'
                    : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary border border-transparent'
                }`
              }
            >
              <link.icon className="h-4 w-4" aria-hidden="true" />
              {link.label}
            </NavLink>
          ))}

          {user ? (
            <>
              <Link
                to="/panel"
                onClick={handleNavClick}
                aria-label="Ir a panel"
                title="Ir a panel"
                className="ml-1 inline-flex items-center gap-2 rounded-lg border border-accent-violet/20 bg-accent-violet/10 px-3 py-1.5 text-sm font-bold text-accent-violet-soft transition-colors hover:bg-accent-violet/20 cursor-pointer font-display tracking-wide"
              >
                <UserAvatar user={user} size="sm" />
                <span className="max-w-28 truncate">{user.displayName ?? user.email ?? 'Usuario'}</span>
                <span className="hidden text-xs font-medium lg:inline">Ir a panel</span>
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-text-secondary hover:text-accent-red hover:bg-accent-red/10 transition-colors cursor-pointer font-display border border-border-subtle px-3 py-2"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Cerrar sesión
              </button>
            </>
          ) : (
            <NavLink
              to="/ingresar"
              onClick={handleNavClick}
              className="ml-1 px-4 py-2 rounded-lg text-sm font-bold inline-flex items-center gap-1.5 transition-all duration-200 cursor-pointer font-display tracking-wide btn-primary-glow text-white"
            >
              <LogIn className="h-4 w-4" aria-hidden="true" />
              Ingresar
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center justify-center h-9 w-9 rounded-lg bg-bg-card border border-border-subtle text-text-secondary hover:text-accent-violet hover:border-accent-violet/30 transition-all duration-200 cursor-pointer"
            aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
            title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          >
            <ThemeIcon className="h-4.5 w-4.5" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={handleMenuToggle}
            className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg bg-bg-card border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors cursor-pointer"
            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isMenuOpen}
          >
          {isMenuOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
        </div>
      </div>

      {isMenuOpen && (
        <nav
          className="md:hidden border-t border-border-subtle bg-bg-card animate-fade-in"
          aria-label="Navegación móvil"
        >
          <div className="flex flex-col p-2 gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-xl text-sm font-medium inline-flex items-center gap-2 transition-all duration-200 cursor-pointer font-display tracking-wide ${
                    isActive
                    ? 'bg-accent-violet/15 text-accent-violet border-l-4 border-accent-violet'
                    : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary border-l-4 border-transparent'
                  }`
                }
                >
                  <link.icon className="h-4 w-4" aria-hidden="true" />
                  {link.label}
                </NavLink>
            ))}
            {user ? (
              <div className="flex flex-col gap-1 mt-1 border-t border-border-subtle pt-1">
                <Link
                  to="/panel"
                  onClick={handleNavClick}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-accent-violet-soft font-display tracking-wide"
                >
                  <UserAvatar user={user} size="sm" />
                  <span className="truncate">{user.displayName ?? user.email ?? 'Usuario'}</span>
                  <span className="ml-auto text-xs font-medium text-text-secondary">Ir a panel</span>
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="px-4 py-3 rounded-xl text-sm font-medium text-text-secondary hover:text-accent-red hover:bg-accent-red/10 transition-colors cursor-pointer font-display border-l-4 border-transparent inline-flex items-center gap-2 text-left"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <NavLink
                to="/ingresar"
                onClick={handleNavClick}
                className="mt-1 px-4 py-3 rounded-xl text-sm font-bold inline-flex items-center gap-2 transition-all duration-200 cursor-pointer font-display tracking-wide btn-primary-glow text-white"
              >
                <LogIn className="h-4 w-4" aria-hidden="true" />
                Ingresar
              </NavLink>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}

export default Header;