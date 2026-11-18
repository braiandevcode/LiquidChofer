import type { ReactNode } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../../../core/context/ThemeContext'
import { cn } from '../../../../shared/lib/utils'
import SettingsCard from './SettingsCard'

type TTheme = 'dark' | 'light'

interface IThemeOption {
  value: TTheme
  label: string
  icon: typeof Moon
}

const THEME_OPTIONS: IThemeOption[] = [
  { value: 'dark', label: 'Oscuro', icon: Moon },
  { value: 'light', label: 'Claro', icon: Sun },
]

const SettingsPreferencesCard = (): ReactNode => {
  const { theme, toggleTheme } = useTheme()

  const handleThemeChange = (nextTheme: TTheme): void => {
    if (theme !== nextTheme) toggleTheme()
  }

  return (
    <SettingsCard
      icon={Sun}
      title="Apariencia"
      description="Elegí cómo se ve LiquidChofer."
      tone="green"
    >
      <div
        role="group"
        aria-label="Tema de la aplicación"
        className="grid grid-cols-2 gap-2 rounded-xl border border-border-subtle bg-bg-input/60 p-1.5"
      >
        {THEME_OPTIONS.map((option) => {
          const Icon = option.icon
          const isActive: boolean = theme === option.value

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleThemeChange(option.value)}
              aria-pressed={isActive}
              className={cn(
                'inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2.5 font-display text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-accent-violet/30',
                isActive
                  ? 'border-accent-violet/20 bg-accent-violet/15 text-accent-violet shadow-sm'
                  : 'border-transparent text-text-secondary hover:bg-bg-hover hover:text-text-primary',
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {option.label}
            </button>
          )
        })}
      </div>

      <p className="mt-3 text-xs text-text-muted">
        La preferencia se guarda en este dispositivo.
      </p>
    </SettingsCard>
  )
}

export default SettingsPreferencesCard
