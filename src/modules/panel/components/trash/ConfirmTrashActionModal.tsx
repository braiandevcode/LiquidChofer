import { useCallback, useEffect, useState, type MouseEvent, type ReactNode } from 'react'
import { AlertTriangle, RotateCcw, X } from 'lucide-react'
import { ApiError } from '../../../../core/services/api'
import { restoreJourney } from '../../../../core/services/journeyHistory.service'
import ModalPortal from '../../../../shared/components/ModalPortal'
import { BLOCK_BODY_SCROLL } from '../../../../shared/lib/bodyScroll'
import { FORMAT_JOURNEY_DATE, FORMAT_TIMESTAMP_DATE_TIME } from '../../../../shared/lib/journey'
import { useFocusTrap } from '../../../../shared/hooks/useFocusTrap'
import LoadingDots from '../../../../shared/styles/LoadingDots'
import StatusBanner from '../../../../shared/styles/StatusBanner'
import Button from '../../../../shared/ui/Button'
import IconButton from '../../../../shared/styles/IconButton'
import { FORMAT_ARS } from '../history/history.utils'
import type {
  IJourneyConflictExisting,
  IJourneyDateExistsPayload,
  IJourneyTrashItem,
} from '../../../../core/types/journeyHistory'

interface IConfirmTrashActionModalProps {
  journey: IJourneyTrashItem | null
  onClose: () => void
  onRestored: (replaced: boolean) => void
  onStale: () => void
}

const TITLE_ID: string = 'confirm-trash-action-title'

const STOP_PROPAGATION = (event: MouseEvent<HTMLDivElement>): void => {
  event.stopPropagation()
}

// PIDO CONFIRMACION ANTES DE RESTAURAR. SI EL BACKEND RESPONDE 409,
// OFREZCO UN SEGUNDO PASO PARA REEMPLAZAR LA JORNADA VIGENTE DE ESA FECHA.
const ConfirmTrashActionModal = ({
  journey,
  onClose,
  onRestored,
  onStale,
}: IConfirmTrashActionModalProps): ReactNode => {
  const isOpen: boolean = journey !== null
  const modalRef = useFocusTrap(isOpen)
  const [isWorking, setIsWorking] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [needsReplace, setNeedsReplace] = useState<boolean>(false)
  const [existing, setExisting] = useState<IJourneyConflictExisting | null>(null)

  useEffect(() => BLOCK_BODY_SCROLL(isOpen), [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const ON_KEY_DOWN = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && !isWorking) onClose()
    }
    document.addEventListener('keydown', ON_KEY_DOWN)
    return () => document.removeEventListener('keydown', ON_KEY_DOWN)
  }, [isOpen, isWorking, onClose])

  const handleRestore = useCallback(
    async (replaceExisting: boolean): Promise<void> => {
      if (!journey || isWorking) return
      setIsWorking(true)
      setError('')
      try {
        await restoreJourney(journey.id, replaceExisting)
        onRestored(replaceExisting)
      } catch (cause) {
        // HAY UNA VIGENTE EN LA MISMA FECHA: PASO AL SEGUNDO PASO DE CONFIRMACION.
        if (
          cause instanceof ApiError &&
          cause.status === 409 &&
          cause.code === 'JOURNEY_DATE_EXISTS'
        ) {
          const payload: IJourneyDateExistsPayload | undefined = cause.payload as
            | IJourneyDateExistsPayload
            | undefined
          setExisting(payload?.existing ?? null)
          setNeedsReplace(true)
        } else if (cause instanceof ApiError && cause.status === 404) {
          // VENCIO, ES AJENA O YA NO ESTA EN PAPELERA: REFRESCO LA LISTA.
          onStale()
        } else {
          setError(cause instanceof Error ? cause.message : 'No se pudo restaurar la jornada.')
        }
        setIsWorking(false)
      }
    },
    [journey, isWorking, onRestored, onStale],
  )

  const handleConfirmClick = useCallback((): void => {
    void handleRestore(false)
  }, [handleRestore])

  const handleReplaceClick = useCallback((): void => {
    void handleRestore(true)
  }, [handleRestore])

  const handleBackdropClick = useCallback((): void => {
    if (!isWorking) onClose()
  }, [isWorking, onClose])

  if (!journey) return null

  const journeyLabel: string = FORMAT_JOURNEY_DATE(journey.journeyDate)

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-4 animate-fade-in"
        onClick={handleBackdropClick}
      >
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={TITLE_ID}
          className="w-full max-w-sm rounded-2xl border border-border-subtle bg-bg-card p-6 shadow-xl animate-scale-in"
          onClick={STOP_PROPAGATION}
        >
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  needsReplace ? 'bg-accent-amber/15' : 'bg-accent-violet/15'
                }`}
              >
                {needsReplace ? (
                  <AlertTriangle className="h-5 w-5 text-accent-amber" aria-hidden="true" />
                ) : (
                  <RotateCcw className="h-5 w-5 text-accent-violet" aria-hidden="true" />
                )}
              </div>
              <h3 id={TITLE_ID} className="font-display text-lg font-bold text-text-primary">
                {needsReplace ? 'Reemplazar jornada vigente' : '¿Restaurar jornada?'}
              </h3>
            </div>
            <IconButton
              onClick={isWorking ? () => undefined : onClose}
              ariaLabel="Cancelar"
              className={isWorking ? 'pointer-events-none opacity-50' : ''}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </IconButton>
          </div>

          <p className="mb-4 text-sm text-text-secondary">
            {needsReplace ? (
              <>
                Ya hay una jornada vigente para el{' '}
                <strong className="text-text-primary">{journeyLabel}</strong>.
              </>
            ) : (
              <>
                La jornada del{' '}
                <strong className="text-text-primary">{journeyLabel}</strong> volverá al historial
                con sus importes originales.
              </>
            )}
          </p>

          {needsReplace && existing && (
            <StatusBanner
              variant="warning"
              icon={<AlertTriangle className="h-4 w-4" aria-hidden="true" />}
              className="mb-4"
            >
              <span className="flex flex-col gap-1">
                <span>
                  Guardada el {FORMAT_TIMESTAMP_DATE_TIME(existing.createdAt)}.
                </span>
                <span>
                  Total: <strong className="text-text-primary">{FORMAT_ARS(existing.total)}</strong>
                </span>
              </span>
            </StatusBanner>
          )}

          {needsReplace && (
            <p className="mb-4 text-sm text-text-secondary">
              Si continuás, esa jornada pasa a la papelera y se restaura la seleccionada.
            </p>
          )}

          {error && (
            <StatusBanner variant="error" className="mb-4">
              {error}
            </StatusBanner>
          )}

          <div className="flex gap-3">
            <Button
              variant="ghost"
              fullWidth={false}
              onClick={onClose}
              disabled={isWorking}
              className="flex-1"
              autoFocus
            >
              Cancelar
            </Button>
            <Button
              variant={needsReplace ? 'danger' : 'primary'}
              fullWidth={false}
              onClick={needsReplace ? handleReplaceClick : handleConfirmClick}
              disabled={isWorking}
              className="flex flex-1 items-center justify-center gap-2"
            >
              {isWorking ? (
                <LoadingDots color={needsReplace ? 'bg-accent-red' : 'bg-slate-900'} />
              ) : (
                <>
                  {needsReplace ? (
                    <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  )}
                  {needsReplace ? 'Reemplazar y restaurar' : 'Restaurar'}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </ModalPortal>
  )
}

export default ConfirmTrashActionModal
