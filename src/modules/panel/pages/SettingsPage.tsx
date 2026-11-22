import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { Percent, Settings, Shield, Sun, UserRound, type LucideIcon } from 'lucide-react'
import SettingsProfileCard from '../components/settings/SettingsProfileCard'
import SettingsPreferencesCard from '../components/settings/SettingsPreferencesCard'
import SettingsPercentagesCard from '../components/settings/SettingsPercentagesCard'
import SettingsAccountCard from '../components/settings/SettingsAccountCard'
import { cn } from '../../../shared/lib/utils'

type TSettingsTabId = 'profile' | 'preferences' | 'repartition' | 'account'

interface ISettingsTab {
  id: TSettingsTabId
  label: string
  description: string
  icon: LucideIcon
}

const SETTINGS_TABS: ISettingsTab[] = [
  { id: 'profile', label: 'Perfil', description: 'Los datos de tu cuenta.', icon: UserRound },
  { id: 'preferences', label: 'Preferencias', description: 'Elegí cómo se ve LiquidChofer.', icon: Sun },
  { id: 'repartition', label: 'Reparto', description: 'Definí cómo se reparte tu jornada.', icon: Percent },
  { id: 'account', label: 'Cuenta', description: 'Administrá el acceso a tu cuenta.', icon: Shield },
]

const SettingsPage = (): ReactNode => {
  const [activeTab, setActiveTab] = useState<TSettingsTabId>('profile')
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const activeIndex: number = SETTINGS_TABS.findIndex((tab) => tab.id === activeTab)
  const activeTabData: ISettingsTab = SETTINGS_TABS[activeIndex] ?? SETTINGS_TABS[0]

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number): void => {
    let nextIndex: number | null = null

    if (event.key === 'ArrowRight') nextIndex = (index + 1) % SETTINGS_TABS.length
    else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + SETTINGS_TABS.length) % SETTINGS_TABS.length
    else if (event.key === 'Home') nextIndex = 0
    else if (event.key === 'End') nextIndex = SETTINGS_TABS.length - 1

    const nextTab: ISettingsTab | undefined = nextIndex === null ? undefined : SETTINGS_TABS[nextIndex]
    if (!nextTab || nextIndex === null) return

    event.preventDefault()
    setActiveTab(nextTab.id)
    tabRefs.current[nextIndex]?.focus()
  }

  return (
    <section className="mx-auto max-w-5xl animate-fade-in-up">
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent-violet/20 bg-accent-violet/10">
          <Settings className="h-5 w-5 text-accent-violet" aria-hidden="true" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-black tracking-tight text-text-primary md:text-3xl">
            Ajustes
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-text-secondary md:text-base">
            Personalizá tu cuenta y tu forma de calcular.
          </p>
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Secciones de ajustes"
        className="mb-4 grid grid-cols-2 gap-1.5 rounded-2xl border border-border-subtle bg-bg-card/60 p-1.5 sm:grid-cols-4"
      >
        {SETTINGS_TABS.map((tab, index) => {
          const Icon = tab.icon
          const isActive: boolean = tab.id === activeTab

          return (
            <button
              key={tab.id}
              ref={(node) => {
                tabRefs.current[index] = node
              }}
              type="button"
              role="tab"
              id={`settings-tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls="settings-panel"
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
              className={cn(
                'inline-flex min-w-0 cursor-pointer items-center justify-center gap-2 rounded-xl px-3 py-2.5 font-display text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-violet/30',
                isActive
                  ? 'border border-accent-violet/20 bg-accent-violet/15 text-accent-violet'
                  : 'border border-transparent text-text-secondary hover:bg-bg-hover hover:text-text-primary',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{tab.label}</span>
            </button>
          )
        })}
      </div>

      <p className="mb-4 text-sm leading-relaxed text-text-secondary">{activeTabData.description}</p>

      <div
        role="tabpanel"
        id="settings-panel"
        aria-labelledby={`settings-tab-${activeTab}`}
        tabIndex={0}
        className="rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-violet/30"
      >
        {activeTab === 'profile' && <SettingsProfileCard />}
        {activeTab === 'preferences' && <SettingsPreferencesCard />}
        {activeTab === 'repartition' && <SettingsPercentagesCard />}
        {activeTab === 'account' && <SettingsAccountCard />}
      </div>
    </section>
  )
}

export default SettingsPage
