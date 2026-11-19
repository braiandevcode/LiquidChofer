import { useCallback, useEffect, type MouseEvent, type ReactNode } from 'react'
import { Save, X } from 'lucide-react'
import { useFocusTrap } from '../../../../../shared/hooks/useFocusTrap'
import ModalPortal from '../../../../../shared/components/ModalPortal'
import Button from '../../../../../shared/ui/Button'
import IconButton from '../../../../../shared/styles/IconButton'
import StatusBanner from '../../../../../shared/styles/StatusBanner'
import CalculationReceiptContent from './CalculationReceiptContent'
import { HAS_RESULT } from './calculation.utils'
import type { ICalculationState } from '../../../../../core/interfaces/ICalculationState'
import { useJourneyShareStatus } from '../../../../../core/hooks/useJourneyShareStatus'

interface ICalculationReceiptModalProps {
  calculation: ICalculationState
  isOpen: boolean
  onClose: () => void
  onSave: (calculation: ICalculationState) => void
  journeyId: string | null
}

// VISTA PREVIA DEL CALCULO DE CHOFIA: SOLO PERMITE GUARDAR LA JORNADA.
// DESCARGAR Y COMPARTIR VIVEN EN LA TARJETA DEL HISTORIAL, NO EN EL CHAT.
const CalculationReceiptModal = ({
  calculation,
  isOpen,
  onClose,
  onSave,
  journeyId,
}: ICalculationReceiptModalProps): ReactNode => {
  const modalRef = useFocusTrap(isOpen)

  // EL BACKEND MANDA: SOLO OCULTO "GUARDAR" SI share-status CONFIRMA UNA JORNADA ACTIVA.
  const { viewState, shareable } = useJourneyShareStatus(journeyId, isOpen)
  const isJourneySaved: boolean = journeyId !== null && viewState === 'ready' && shareable
  const isVerifyingJourney: boolean = viewState === 'loading'

  const receiptId: string = `calculation-receipt-${calculation.id}`
  const titleId: string = `calculation-receipt-title-${calculation.id}`

  // BLOQUEO EL SCROLL DEL BODY Y CIERRO CON ESCAPE MIENTRAS EL MODAL ESTA ABIERTO.
  const HANDLE_MODAL_EFFECTS = (): (() => void) | undefined => {
    if (!isOpen) return undefined
    document.body.classList.add('overflow-hidden')

    const HANDLE_ESCAPE = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', HANDLE_ESCAPE)

    return () => {
      document.body.classList.remove('overflow-hidden')
      document.removeEventListener('keydown', HANDLE_ESCAPE)
    }
  }
  useEffect(HANDLE_MODAL_EFFECTS, [isOpen, onClose])

  const HANDLE_SAVE = useCallback((): void => {
    onSave(calculation)
  }, [onSave, calculation])

  const HANDLE_SAVE_CLICK = (): void => {
    HANDLE_SAVE()
  }

  const HANDLE_BACKDROP_CLICK = (event: MouseEvent<HTMLDivElement>): void => {
    if (event.target === event.currentTarget) onClose()
  }

  if (!isOpen || !HAS_RESULT(calculation)) return null

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 animate-fade-in"
        onClick={HANDLE_BACKDROP_CLICK}
      >
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="relative flex max-h-[calc(100vh-2rem)] w-full max-w-md flex-col rounded-2xl border border-border-subtle bg-bg-card shadow-xl animate-scale-in print-white"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-border-subtle p-4 no-print">
            <h2 id={titleId} className="text-lg font-bold text-text-primary font-display tracking-wide">
              Recibo de jornada
            </h2>
            <IconButton onClick={onClose} ariaLabel="Cerrar recibo" size="md" autoFocus>
              <X className="h-5 w-5" aria-hidden="true" />
            </IconButton>
          </div>

          <div className="receipt-scroll min-h-0 flex-1 overflow-y-auto">
            <CalculationReceiptContent calculation={calculation} elementId={receiptId} />
          </div>

          <div className="flex shrink-0 flex-col gap-2 border-t border-border-subtle p-4 no-print">
            {viewState === 'error' ? (
              <StatusBanner variant="error">No se pudo verificar el estado de la jornada.</StatusBanner>
            ) : isJourneySaved ? (
              <StatusBanner variant="info">
                Jornada guardada. Descargá y compartí el recibo desde el historial.
              </StatusBanner>
            ) : isVerifyingJourney ? (
              <p className="text-center text-xs text-text-muted">Verificando el estado de la jornada...</p>
            ) : (
              <Button
                variant="primary"
                onClick={HANDLE_SAVE_CLICK}
                className="flex items-center justify-center gap-2"
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                Guardar jornada
              </Button>
            )}
          </div>
        </div>
      </div>
    </ModalPortal>
  )
}

export default CalculationReceiptModal
