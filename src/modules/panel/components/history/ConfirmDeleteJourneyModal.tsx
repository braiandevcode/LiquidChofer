import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, Trash2, X } from 'lucide-react'
import { deleteJourney } from '../../../../core/services/journeyHistory.service'
import { useFocusTrap } from '../../../../shared/hooks/useFocusTrap'
import { BLOCK_BODY_SCROLL } from '../../../../shared/lib/bodyScroll'
import LoadingDots from '../../../../shared/styles/LoadingDots'
import StatusBanner from '../../../../shared/styles/StatusBanner'
import Button from '../../../../shared/ui/Button'
import IconButton from '../../../../shared/styles/IconButton'
import { FORMAT_JOURNEY_DATE } from '../../../../shared/lib/journey'
import type { IJourneyHistory } from '../../../../core/types/journeyHistory'

interface IConfirmDeleteJourneyModalProps {
  journey: IJourneyHistory | null
  onClose: () => void
  onDeleted: (journey: IJourneyHistory) => void
}

const TITLE_ID: string = 'confirm-delete-journey-title'

const ConfirmDeleteJourneyModal = ({
  journey,
  onClose,
  onDeleted,
}: IConfirmDeleteJourneyModalProps): ReactNode => {
  const isOpen: boolean = journey !== null
  const modalRef = useFocusTrap(isOpen)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  useEffect(() => BLOCK_BODY_SCROLL(isOpen), [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const ON_KEY_DOWN = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && !isDeleting) onClose()
    }
    document.addEventListener('keydown', ON_KEY_DOWN)
    return () => document.removeEventListener('keydown', ON_KEY_DOWN)
  }, [isOpen, isDeleting, onClose])

  const handleConfirm = useCallback(async (): Promise<void> => {
    if (!journey || isDeleting) return
    setIsDeleting(true)
    setError('')
    try {
      await deleteJourney(journey.id)
      onDeleted(journey)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo eliminar la jornada.')
    } finally {
      setIsDeleting(false)
    }
  }, [journey, isDeleting, onDeleted])

  if (!journey) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-4 animate-fade-in"
      onClick={() => !isDeleting && onClose()}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={TITLE_ID}
        className="w-full max-w-sm rounded-2xl border border-border-subtle bg-bg-card p-6 shadow-xl animate-scale-in"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-red/15">
              <AlertTriangle className="h-5 w-5 text-accent-red" aria-hidden="true" />
            </div>
            <h3 id={TITLE_ID} className="font-display text-lg font-bold text-text-primary">
              ¿Eliminar jornada?
            </h3>
          </div>
          <IconButton
            onClick={isDeleting ? () => undefined : onClose}
            ariaLabel="Cancelar"
            className={isDeleting ? 'pointer-events-none opacity-50' : ''}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </IconButton>
        </div>

        <p className="mb-4 text-sm text-text-secondary">
          La jornada del{' '}
          <strong className="text-text-primary">
            {FORMAT_JOURNEY_DATE(journey.journeyDate)}
          </strong>{' '}
          se enviará a la papelera. Podés recuperarla desde ahí.
        </p>

        {error && <StatusBanner variant="error" className="mb-4">{error}</StatusBanner>}

        <div className="flex gap-3">
          <Button
            variant="ghost"
            fullWidth={false}
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1"
            autoFocus
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            fullWidth={false}
            onClick={() => void handleConfirm()}
            disabled={isDeleting}
            className="flex flex-1 items-center justify-center gap-2"
          >
            {isDeleting ? <LoadingDots color="bg-accent-red" /> : (
              <>
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Eliminar
              </>
            )}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default ConfirmDeleteJourneyModal
