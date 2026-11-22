import {
  type ReactNode,
} from 'react'
import { Percent } from 'lucide-react'
import { useUserSettings } from '../../../../core/context/UserSettingsContext'
import LoadingDots from '../../../../shared/styles/LoadingDots'
import SettingsCard from './SettingsCard'
import { SettingsPercentagesForm } from './SettingsPercentagesForm'

// TARJETA DE PORCENTAJES POR DEFECTO
const SettingsPercentagesCard = (): ReactNode => {
  const { settings, isLoading, version, loadError, reload, save } = useUserSettings()

  return (
    <SettingsCard
      icon={Percent}
      title="Porcentajes por defecto"
      description="Definí cómo se reparte tu jornada."
      tone="blue"
    >
      {isLoading && !settings ? (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-text-secondary">
          <LoadingDots />
          <span>Cargando tus porcentajes...</span>
        </div>
      ) : (
        <SettingsPercentagesForm
          key={version} // REMONTO EL FORMULARIO CUANDO EL BACKEND DEVUELVE DATOS NUEVOS
          initialSettings={settings}
          loadError={loadError}
          isReloading={isLoading}
          onRetry={reload}
          onSave={save}
        />
      )}
    </SettingsCard>
  )
}

export default SettingsPercentagesCard
