import type { ReactNode } from 'react'
import { Settings } from 'lucide-react'
import SettingsProfileCard from '../components/settings/SettingsProfileCard'
import SettingsPreferencesCard from '../components/settings/SettingsPreferencesCard'
import SettingsPercentagesCard from '../components/settings/SettingsPercentagesCard'
import SettingsAccountCard from '../components/settings/SettingsAccountCard'

const SettingsPage = (): ReactNode => (
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

    <div className="grid gap-4 lg:grid-cols-2">
      <SettingsProfileCard />
      <SettingsPreferencesCard />
      <SettingsPercentagesCard />
      <SettingsAccountCard />
    </div>
  </section>
)

export default SettingsPage
