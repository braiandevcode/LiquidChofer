import { useCallback, useState, type ReactNode, type SubmitEvent } from "react"
import type { IUserSettingsProfile, TUserSettingsPayload } from "../../../../core/types/settings"
import useCalculatorContext from "../../../../core/context/useCalculatorContext"
import { initialState } from "../../../../core/config/calculates.config"
import { HAS_ACTIVE_JOURNEY } from "../../../../shared/lib/journey"
import ConfirmResetModal from "../../../calculator/modals/ConfirmResetModal"
import { AlertCircle, Calculator, CheckCircle2 } from 'lucide-react'
import PercentageInput from "../../../../shared/ui/PercentageInput"
import Toggle from "../../../../shared/ui/Toggle"
import StatusBanner from "../../../../shared/styles/StatusBanner"
import Button from "../../../../shared/ui/Button"
import LoadingDots from "../../../../shared/styles/LoadingDots"
import { Link } from 'react-router-dom'
import CarOwnerSelector from "../../../../shared/ui/CarOwnerSelector"
const PERCENT_TOTAL: number = 100

export interface ISettingsPercentagesFormProps {
  initialSettings: IUserSettingsProfile | null
  loadError: string
  isReloading: boolean
  onRetry: () => Promise<void>
  onSave: (payload: TUserSettingsPayload) => Promise<IUserSettingsProfile>
}

export const SettingsPercentagesForm = ({
  initialSettings,
  loadError,
  isReloading,
  onRetry,
  onSave,
}: ISettingsPercentagesFormProps): ReactNode => {
  const { state, dispatch } = useCalculatorContext()

  // LINEA BASE: LOS VALORES GUARDADOS CONTRA LOS QUE COMPARO LOS CAMBIOS
  const baseline = {
    agencyPercent: initialSettings?.defaultAgencyPercent ?? initialState.agencyPercent,
    driverPercent: initialSettings?.defaultDriverPercent ?? initialState.driverPercent,
    carPercent: initialSettings?.defaultCarPercent ?? initialState.carPercent,
    carRented: initialSettings?.defaultCarRented ?? initialState.carRented,
    carOwner: initialSettings?.defaultCarOwner ?? initialState.carOwner,
  }

  const [agencyPercent, setAgencyPercent] = useState<number>(baseline.agencyPercent)
  const [driverPercent, setDriverPercent] = useState<number>(baseline.driverPercent)
  const [carPercent, setCarPercent] = useState<number>(baseline.carPercent)
  const [carRented, setCarRented] = useState<boolean>(baseline.carRented)
  const [carOwner, setCarOwner] = useState<'agency' | 'driver' | null>(baseline.carOwner)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [formError, setFormError] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState<string>('')
  const [showResetHint, setShowResetHint] = useState<boolean>(false)
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false)

  const hasActiveJourney: boolean = HAS_ACTIVE_JOURNEY(state)
  const percentTotal: number = carRented
    ? agencyPercent + driverPercent + carPercent
    : agencyPercent + driverPercent
  const isValid: boolean = percentTotal === PERCENT_TOTAL
  const difference: number = PERCENT_TOTAL - percentTotal

  const isDirty: boolean =
    agencyPercent !== baseline.agencyPercent ||
    driverPercent !== baseline.driverPercent ||
    carRented !== baseline.carRented ||
    (carRented && carPercent !== baseline.carPercent) ||
    (!carRented && (carOwner ?? 'agency') !== (baseline.carOwner ?? 'agency'))

  const CLEAR_FEEDBACK = useCallback((): void => {
    setFormError('')
    setSuccessMessage('')
    setShowResetHint(false)
  }, [])

  const handleAgencyPercentChange = useCallback((value: number): void => {
    setAgencyPercent(value)
    CLEAR_FEEDBACK()
  }, [CLEAR_FEEDBACK])

  const handleDriverPercentChange = useCallback((value: number): void => {
    setDriverPercent(value)
    CLEAR_FEEDBACK()
  }, [CLEAR_FEEDBACK])

  const handleCarPercentChange = useCallback((value: number): void => {
    setCarPercent(value)
    CLEAR_FEEDBACK()
  }, [CLEAR_FEEDBACK])

  const handleCarRentedChange = useCallback((enabled: boolean): void => {
    setCarRented(enabled)
    CLEAR_FEEDBACK()
  }, [CLEAR_FEEDBACK])

  const handleCarOwnerChange = useCallback((owner: 'agency' | 'driver'): void => {
    setCarOwner(owner)
    CLEAR_FEEDBACK()
  }, [CLEAR_FEEDBACK])

  // HANDLE SUBMIT: VALIDO LOS PORCENTAJES Y LLAMO AL BACKEND PARA GUARDARLOS
  const handleSubmit = useCallback(async (e: SubmitEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setFormError('')
    setSuccessMessage('')
    setShowResetHint(false)

    // SI NO HAY CAMBIOS RESPECTO A LO GUARDADO, NO LLAMO AL BACKEND
    if (!isDirty) return

    // VALIDO QUE CADA PORCENTAJE ESTE ENTRE 0 Y 100 Y QUE LA SUMA SEA 100
    const HAS_OUT_OF_RANGE: boolean =
      agencyPercent > PERCENT_TOTAL ||
      driverPercent > PERCENT_TOTAL ||
      (carRented && carPercent > PERCENT_TOTAL)

    // SI HAY ALGUN PORCENTAJE FUERA DE RANGO, O LA SUMA NO ES 100, MUESTRO ERROR Y NO LLAMO AL BACKEND
    if (HAS_OUT_OF_RANGE) {
      setFormError('Cada porcentaje debe estar entre 0 y 100.')
      return
    }

    // SI LA SUMA NO ES 100, MUESTRO ERROR Y NO LLAMO AL BACKEND
    if (!isValid) {
      setFormError(`Los porcentajes deben sumar 100 (suman ${percentTotal}).`)
      return
    }

    setIsSaving(true)
    try {
      await onSave({
        defaultAgencyPercent: agencyPercent,
        defaultDriverPercent: driverPercent,
        defaultCarRented: carRented,
        defaultCarPercent: carRented ? carPercent : null, // SI NO ALQUILA, EL BACKEND ESPERA NULL
        defaultCarOwner: carRented ? null : carOwner !== null ? carOwner : 'agency', // SI NO ALQUILA, EL BACKEND ESPERA EL DUEÑO DEL AUTO
      })

      if (hasActiveJourney) {
        setSuccessMessage('Guardado. Tu jornada actual no cambió.')
        setShowResetHint(true)
      } else {
        setSuccessMessage('Listo. Tus nuevos porcentajes ya quedaron aplicados.')
      }
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'No se pudieron guardar los porcentajes por defecto.',
      )
    } finally {
      setIsSaving(false)
    }
  }, [agencyPercent, carOwner, driverPercent, carRented, carPercent, isValid, percentTotal, hasActiveJourney, isDirty, onSave])

  const handleOpenResetModal = useCallback((): void => setIsResetModalOpen(true), [])
  const handleCloseResetModal = useCallback((): void => setIsResetModalOpen(false), [])

  const handleConfirmReset = useCallback((): void => {
    dispatch({
      type: 'RESET',
      payload: { agencyPercent, driverPercent, carPercent, carRented, carOwner: carRented ? null : (carOwner ?? 'agency') },
    })
    setIsResetModalOpen(false)
    setShowResetHint(false)
    setSuccessMessage('Listo. Jornada reiniciada con tus nuevos porcentajes.')
  }, [dispatch, agencyPercent, driverPercent, carPercent, carRented, carOwner])

  return (
    <>
      <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]" noValidate>
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-border-subtle bg-bg-input/60 p-3">
            <Toggle
              label="Vehículo alquilado"
              enabled={carRented}
              disabled={isSaving}
              onChange={handleCarRentedChange}
            />
          </div>
          
          {!carRented && (
            <div className="rounded-xl border border-border-subtle bg-bg-input/60 p-3">
              <CarOwnerSelector value={carOwner ?? 'agency'} onChange={handleCarOwnerChange} disabled={isSaving} />
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <PercentageInput
              label="% Agencia"
              value={agencyPercent}
              onChange={handleAgencyPercentChange}
              disabled={isSaving}
              hint="% Que se lleva la agencia"
            />
            <PercentageInput
              label="% Conductor"
              value={driverPercent}
              onChange={handleDriverPercentChange}
              disabled={isSaving}
              hint="Tu porcentaje"
            />
          </div>

          {carRented && (
            <PercentageInput
              label="% Vehículo"
              value={carPercent}
              onChange={handleCarPercentChange}
              disabled={isSaving}
              hint="Porcentaje para gastos del vehículo"
            />
          )}

          <p className="text-xs text-text-muted">
            {carRented
              ? 'La suma de agencia, conductor y vehículo debe ser 100%.'
              : 'La suma de agencia y conductor debe ser 100%.'}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <div
            role="status"
            aria-live="polite"
            className={`flex items-start gap-2.5 rounded-xl border p-3 ${isValid
              ? 'border-accent-green/30 bg-accent-green/10'
              : 'border-accent-red/30 bg-accent-red/10'
              }`}
          >
            {isValid ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent-green" aria-hidden="true" />
            ) : (
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-accent-red" aria-hidden="true" />
            )}
            <div>
              <p
                className={`font-display text-sm font-bold ${isValid ? 'text-accent-green' : 'text-accent-red'
                  }`}
              >
                Suma: {percentTotal}%
              </p>
              <p className="text-xs text-text-secondary">
                {isValid
                  ? isDirty
                    ? 'Los porcentajes están listos para guardar.'
                    : 'No hay cambios para guardar.'
                  : difference > 0
                    ? `Sumá ${difference}% más en total.`
                    : `Sacá ${Math.abs(difference)}% en total.`}
              </p>
            </div>
          </div>

          {loadError && (
            <StatusBanner variant="error">
              <span className="flex flex-col gap-1.5">
                {loadError}
                <button
                  type="button"
                  onClick={() => void onRetry()}
                  disabled={isReloading}
                  className="inline-flex w-fit cursor-pointer items-center rounded-lg border border-accent-red/30 px-2.5 py-1 font-display text-xs font-bold text-accent-red transition-colors hover:bg-accent-red/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isReloading ? 'Reintentando...' : 'Reintentar'}
                </button>
              </span>
            </StatusBanner>
          )}

          {formError && <StatusBanner variant="error">{formError}</StatusBanner>}
          {successMessage && <StatusBanner variant="success">{successMessage}</StatusBanner>}

          {showResetHint && (
            <StatusBanner variant="warning">
              <span className="flex flex-col gap-2">
                <span>Los nuevos porcentajes se usan cuando reinicies la jornada.</span>
                <button
                  type="button"
                  onClick={handleOpenResetModal}
                  className="inline-flex w-fit cursor-pointer items-center rounded-lg border border-accent-amber/40 px-2.5 py-1 font-display text-xs font-bold text-accent-amber transition-colors hover:bg-accent-amber/10"
                >
                  Reiniciar jornada
                </button>
              </span>
            </StatusBanner>
          )}

          <Button
            type="submit"
            disabled={isSaving || !isValid || !isDirty}
            className="flex items-center justify-center gap-2"
          >
            {isSaving ? <LoadingDots /> : 'Guardar porcentajes'}
          </Button>

          <Link
            to="/panel/calculadora"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border-subtle bg-bg-card px-6 py-3 font-display text-sm font-semibold text-text-primary transition-colors hover:border-border-emphasis hover:bg-bg-hover focus:outline-none focus:ring-2 focus:ring-accent-violet/30"
          >
            <Calculator className="h-4 w-4" aria-hidden="true" />
            Ajustar en la calculadora
          </Link>
        </div>
      </form>

      <ConfirmResetModal
        isOpen={isResetModalOpen}
        onConfirm={handleConfirmReset}
        onCancel={handleCloseResetModal}
      />
    </>
  )
}
