import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type MouseEvent,
  type ReactNode,
  type SubmitEvent,
} from 'react'
import { AlertTriangle, CalendarDays, Save, X } from 'lucide-react'
import useCalculatorContext from '../../../core/context/useCalculatorContext'
import { calculateResult } from '../../../core/hooks/useCalculator'
import { useSaveJourney } from '../hooks/useSaveJourney'
import { TO_CREATE_JOURNEY_PAYLOAD } from '../lib/journeyPayload'
import {
  FORMAT_JOURNEY_DATE,
  FORMAT_TIMESTAMP_DATE_TIME,
  TODAY_LOCAL_DATE,
} from '../../../shared/lib/journey'
import ModalPortal from '../../../shared/components/ModalPortal'
import { useFocusTrap } from '../../../shared/hooks/useFocusTrap'
import LoadingDots from '../../../shared/styles/LoadingDots'
import StatusBanner from '../../../shared/styles/StatusBanner'
import Button from '../../../shared/ui/Button'
import IconButton from '../../../shared/styles/IconButton'
import type { IJourneyDetail } from '../../../core/types/journeyHistory'
import type { ICalculatorResult } from '../../../core/interfaces/ICalculatorResult'
import type { ICalculationState } from '../../../core/interfaces/ICalculationState'
import { TO_CHAT_JOURNEY_PAYLOAD } from '../../panel/components/chat/calculation/calculationJourneyPayload'

interface ISaveJourneyModalProps {
  isOpen: boolean
  onClose: () => void
  onSaved: (journey: IJourneyDetail) => void
  // Cuando viene del chat, el payload se arma desde el cálculo de ChófIA.
  calculation?: ICalculationState | null
}

const TITLE_ID: string = 'save-journey-title'
const DATE_ID: string = 'save-journey-date'

const SaveJourneyModal = ({ isOpen, onClose, onSaved, calculation = null }: ISaveJourneyModalProps): ReactNode => {
  const { state } = useCalculatorContext()
  const { saveJourney, isSaving, error, conflict, clearConflict } = useSaveJourney()
  const modalRef = useFocusTrap(isOpen)
  const [journeyDate, setJourneyDate] = useState<string>(TODAY_LOCAL_DATE())

  const result: ICalculatorResult = useMemo(() => calculateResult(state), [state])

  const effectiveVoucherCount: number = useMemo(
    () =>
      state.showVouchers
        ? state.vouchers.filter((voucher) => voucher.saved && !voucher.editing).length
        : 0,
    [state.showVouchers, state.vouchers],
  )

  const isConfirmingReplace: boolean = conflict !== null

  // EL RESUMEN SALE DEL CALCULO DEL CHAT O DEL ESTADO DE LA CALCULADORA, SEGUN EL ORIGEN.
  const summaryTotal: number = calculation ? (calculation.input.totalInvoiced ?? 0) : state.total
  const summaryProfit: number = calculation ? (calculation.result?.profit ?? 0) : result.adjustedTotal
  const summaryVoucherCount: number = calculation
    ? (calculation.input.vouchers?.length ?? 0)
    : effectiveVoucherCount

  // CIERRO LIMPIANDO EL CONFLICTO PARA QUE NO REAPAREZCA AL VOLVER A ABRIR EL MODAL.
  const handleClose = useCallback((): void => {
    clearConflict()
    onClose()
  }, [clearConflict, onClose])

  // CIERRO CON ESCAPE
  useEffect(() => {
    if (!isOpen) return
    const ON_KEY_DOWN = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && !isSaving) handleClose()
    }
    document.addEventListener('keydown', ON_KEY_DOWN)
    return () => document.removeEventListener('keydown', ON_KEY_DOWN)
  }, [isOpen, isSaving, handleClose])

  const handleBackdropClick = useCallback(
    (event: MouseEvent<HTMLDivElement>): void => {
      if (event.target === event.currentTarget && !isSaving) handleClose()
    },
    [isSaving, handleClose],
  )

  const handleStopPropagation = useCallback((event: MouseEvent): void => {
    event.stopPropagation()
  }, [])

  const handleSubmit = useCallback(
    async (event: SubmitEvent<HTMLFormElement>): Promise<void> => {
      event.preventDefault()
      if (isSaving || !journeyDate) return

      clearConflict()
      const payload = calculation
        ? TO_CHAT_JOURNEY_PAYLOAD(calculation, journeyDate)
        : TO_CREATE_JOURNEY_PAYLOAD(state, journeyDate)
      const journey: IJourneyDetail | null = await saveJourney(payload)
      if (journey) onSaved(journey)
    },
    [isSaving, journeyDate, clearConflict, saveJourney, state, calculation, onSaved],
  )

  // REENVIO EL GUARDADO CON replaceExisting PARA QUE EL BACKEND MUEVA LA ANTERIOR A LA PAPELERA.
  const handleReplace = useCallback(async (): Promise<void> => {
    if (!conflict || isSaving) return

    const payload = calculation
      ? TO_CHAT_JOURNEY_PAYLOAD(calculation, conflict.journeyDate, true)
      : TO_CREATE_JOURNEY_PAYLOAD(state, conflict.journeyDate, true)
    const journey: IJourneyDetail | null = await saveJourney(payload)
    if (journey) onSaved(journey)
  }, [conflict, isSaving, saveJourney, state, calculation, onSaved])

  const handleBackToForm = useCallback((): void => {
    clearConflict()
  }, [clearConflict])

  if (!isOpen) return null

  const maxDate: string = TODAY_LOCAL_DATE()
  const existingCreatedAt: string = conflict?.existing
    ? FORMAT_TIMESTAMP_DATE_TIME(conflict.existing.createdAt)
    : ''

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 animate-fade-in"
        onClick={handleBackdropClick}
      >
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={TITLE_ID}
          className="w-full max-w-md rounded-2xl bg-bg-card border border-border-subtle shadow-xl animate-scale-in"
          onClick={handleStopPropagation}
        >
          <div className="flex items-start justify-between gap-3 border-b border-border-subtle p-5">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  isConfirmingReplace ? 'bg-accent-amber/15' : 'bg-accent-violet/15'
                }`}
              >
                {isConfirmingReplace ? (
                  <AlertTriangle className="h-5 w-5 text-accent-amber" aria-hidden="true" />
                ) : (
                  <Save className="h-5 w-5 text-accent-violet" aria-hidden="true" />
                )}
              </div>
              <div>
                <h2 id={TITLE_ID} className="font-display text-lg font-bold text-text-primary">
                  {isConfirmingReplace ? 'Reemplazar jornada' : 'Guardar jornada'}
                </h2>
                <p className="text-xs text-text-secondary">
                  {isConfirmingReplace
                    ? 'Ya hay una jornada guardada para esa fecha.'
                    : 'Queda en tu historial y no se puede editar.'}
                </p>
              </div>
            </div>
            <IconButton
              onClick={isSaving ? () => undefined : handleClose}
              ariaLabel="Cerrar"
              size="md"
              className={isSaving ? 'pointer-events-none opacity-50' : ''}
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </IconButton>
          </div>

          {isConfirmingReplace && conflict ? (
            <div className="flex flex-col gap-4 p-5" aria-live="polite">
              <p className="text-sm text-text-secondary">
                Ya existe una jornada para el{' '}
                <strong className="text-text-primary">
                  {FORMAT_JOURNEY_DATE(conflict.journeyDate)}
                </strong>
                .
              </p>

              {existingCreatedAt && (
                <StatusBanner
                  variant="warning"
                  icon={<AlertTriangle className="h-4 w-4" aria-hidden="true" />}
                >
                  La guardaste el{' '}
                  <strong className="text-text-primary">{existingCreatedAt}</strong>.
                </StatusBanner>
              )}

              <p className="text-sm text-text-secondary">
                Si la reemplazás, la jornada anterior se mueve a la papelera y esta queda como la
                vigente de esa fecha.
              </p>

              {error && <StatusBanner variant="error">{error}</StatusBanner>}

              <div className="flex gap-3 pt-1">
                <Button
                  variant="ghost"
                  fullWidth={false}
                  onClick={handleBackToForm}
                  disabled={isSaving}
                  className="flex-1"
                  autoFocus
                >
                  Volver
                </Button>
                <Button
                  variant="danger"
                  fullWidth={false}
                  onClick={() => void handleReplace()}
                  disabled={isSaving}
                  className="flex flex-1 items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <LoadingDots color="bg-accent-red" />
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                      Reemplazar
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5" noValidate>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor={DATE_ID}
                  className="flex items-center gap-1.5 text-sm font-bold text-text-primary font-display tracking-wide"
                >
                  <CalendarDays className="h-4 w-4 text-text-muted" aria-hidden="true" />
                  Fecha de la jornada
                </label>
                <input
                  id={DATE_ID}
                  type="date"
                  value={journeyDate}
                  max={maxDate}
                  onChange={(event) => setJourneyDate(event.target.value)}
                  disabled={isSaving}
                  required
                  className="w-full rounded-xl border border-border-subtle bg-bg-input px-4 py-3 text-base text-text-primary outline-none transition-colors focus:border-accent-violet/60 focus:ring-2 focus:ring-accent-violet/20 disabled:opacity-60"
                />
              </div>

              <div className="rounded-xl border border-border-subtle bg-bg-card-subtle p-3 text-sm">
                <div className="flex items-center justify-between py-1">
                  <span className="text-text-secondary">Total facturado</span>
                  <span className="font-semibold text-text-primary font-display">
                    ${summaryTotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-text-secondary">Ganancia estimada</span>
                  <span className="font-semibold text-accent-teal font-display">
                    ${summaryProfit.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-text-secondary">Vales incluidos</span>
                  <span className="font-semibold text-text-primary font-display">
                    {summaryVoucherCount}
                  </span>
                </div>
              </div>

              <StatusBanner variant="info">
                Revisá los datos antes de guardar. Después vas a poder ver y descargar el resumen.
              </StatusBanner>

              {error && <StatusBanner variant="error">{error}</StatusBanner>}

              <div className="flex gap-3 pt-1">
                <Button
                  variant="ghost"
                  fullWidth={false}
                  onClick={handleClose}
                  disabled={isSaving}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  fullWidth={false}
                  disabled={isSaving || !journeyDate}
                  className="flex flex-1 items-center justify-center gap-2"
                >
                  {isSaving ? <LoadingDots color="bg-slate-900" /> : 'Guardar'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </ModalPortal>
  )
}

export default SaveJourneyModal
