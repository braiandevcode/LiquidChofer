import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, Download, Share2, Trash2, X } from 'lucide-react'
import { useJourneyShareStatus } from '../../../../core/hooks/useJourneyShareStatus'
import { useReceiptExport } from '../../../../core/hooks/useReceiptExport'
import { useFocusTrap } from '../../../../shared/hooks/useFocusTrap'
import { BLOCK_BODY_SCROLL } from '../../../../shared/lib/bodyScroll'
import { JOURNEY_RECEIPT_DATA } from '../../../../shared/lib/journeyReceipt'
import { FORMAT_JOURNEY_DATE } from '../../../../shared/lib/journey'
import { VERIFICATION_URL } from '../../../../shared/lib/verification'
import LoadingDots from '../../../../shared/styles/LoadingDots'
import StatusBanner from '../../../../shared/styles/StatusBanner'
import Button from '../../../../shared/ui/Button'
import IconButton from '../../../../shared/styles/IconButton'
import ReceiptContent from '../../../calculator/components/ReceiptContent'
import type { IJourneyDetail } from '../../../../core/types/journeyHistory'

interface IJourneyDetailModalProps {
  journeyId: string | null
  onClose: () => void
  onRequestDelete: (journey: IJourneyDetail) => void
  onJourneyUnavailable?: (journeyId: string) => void
}

type TExportStage = 'idle' | 'checking' | 'exporting'

const TITLE_ID: string = 'journey-detail-title'
const RECEIPT_ELEMENT_ID: string = 'journey-history-receipt'

const JourneyDetailModal = ({
  journeyId,
  onClose,
  onRequestDelete,
  onJourneyUnavailable,
}: IJourneyDetailModalProps): ReactNode => {
  const isOpen: boolean = journeyId !== null
  const modalRef = useFocusTrap(isOpen)
  const { shareImage, downloadPDF } = useReceiptExport()
  const { viewState, shareable, journey, verificationCode, error, retry, verify } =
    useJourneyShareStatus(journeyId, isOpen)
  const [exportStage, setExportStage] = useState<TExportStage>('idle')
  const [actionError, setActionError] = useState<string>('')
  const reportedUnavailableRef = useRef<string | null>(null)

  const isBusy: boolean = exportStage !== 'idle'
  const isLoading: boolean = viewState === 'loading'
  const isLoadError: boolean = viewState === 'error'
  const isUnavailable: boolean = viewState === 'ready' && !shareable
  const canExport: boolean = shareable && journey !== null

  // SI share-status DICE QUE YA NO ESTA DISPONIBLE, AVISO AL LISTADO PARA QUE SAQUE LA FILA OBSOLETA.
  // EL ref EVITA AVISAR DOS VECES POR EL DOBLE EFECTO DE StrictMode.
  useEffect(() => {
    if (!isOpen || !journeyId || !isUnavailable) return
    if (reportedUnavailableRef.current === journeyId) return
    reportedUnavailableRef.current = journeyId
    onJourneyUnavailable?.(journeyId)
  }, [isOpen, journeyId, isUnavailable, onJourneyUnavailable])

  useEffect(() => BLOCK_BODY_SCROLL(isOpen), [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const ON_KEY_DOWN = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && !isBusy) onClose()
    }
    document.addEventListener('keydown', ON_KEY_DOWN)
    return () => document.removeEventListener('keydown', ON_KEY_DOWN)
  }, [isOpen, isBusy, onClose])

  const handleBackdropClick = useCallback(
    (event: MouseEvent<HTMLDivElement>): void => {
      if (event.target === event.currentTarget && !isBusy) onClose()
    },
    [isBusy, onClose],
  )

  // ANTES DE GENERAR EL ARCHIVO VUELVO A CONSULTAR share-status.
  // ASI DETECTO SI LA JORNADA SE ELIMINO O REEMPLAZO DESDE OTRO DISPOSITIVO.
  const handleExport = useCallback(
    async (kind: 'pdf' | 'share'): Promise<void> => {
      if (!journeyId || isBusy) return

      setActionError('')
      setExportStage('checking')

      const verification = await verify()
      if (!verification.ok) {
        setActionError(verification.message)
        setExportStage('idle')
        return
      }

      setExportStage('exporting')
      try {
        if (kind === 'share') {
          await shareImage(
            RECEIPT_ELEMENT_ID,
            verificationCode ? VERIFICATION_URL(verificationCode) : undefined,
          )
        } else {
          const journeyDate: string = verification.journey?.journeyDate ?? 'resumen'
          await downloadPDF(RECEIPT_ELEMENT_ID, `jornada-${journeyDate}.pdf`)
        }
      } catch (cause) {
        // SI EL USUARIO CANCELA EL DIALOGO DE COMPARTIR NO ES UN ERROR REAL.
        if (!(cause instanceof Error) || cause.name !== 'AbortError') {
          setActionError('No se pudo generar el recibo. Probá de nuevo.')
        }
      } finally {
        setExportStage('idle')
      }
    },
    [journeyId, isBusy, verify, shareImage, downloadPDF, verificationCode],
  )

  const handleDelete = useCallback((): void => {
    if (journey && shareable) onRequestDelete(journey)
  }, [journey, shareable, onRequestDelete])

  if (!isOpen) return null

  const receiptData = journey && shareable ? JOURNEY_RECEIPT_DATA(journey, verificationCode) : null
  const subtitle: string = journey
    ? FORMAT_JOURNEY_DATE(journey.journeyDate)
    : isUnavailable
      ? 'No disponible'
      : 'Cargando...'

  const exportLabel = (idleLabel: string): string => {
    if (exportStage === 'checking') return 'Verificando...'
    if (exportStage === 'exporting') return 'Exportando...'
    return idleLabel
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={TITLE_ID}
        className="relative flex max-h-[calc(100vh-2rem)] w-full max-w-md flex-col rounded-2xl border border-border-subtle bg-bg-card shadow-xl animate-scale-in print-white"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border-subtle p-4">
          <div className="min-w-0">
            <h2 id={TITLE_ID} className="truncate font-display text-lg font-bold text-text-primary">
              Detalle de la jornada
            </h2>
            <p className="truncate text-xs text-text-muted">{subtitle}</p>
          </div>
          <IconButton
            onClick={isBusy ? () => undefined : onClose}
            ariaLabel="Cerrar"
            size="md"
            className={isBusy ? 'pointer-events-none opacity-50' : ''}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </IconButton>
        </div>

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center gap-2 py-16 text-sm text-text-secondary">
            <LoadingDots />
            <span>Verificando jornada...</span>
          </div>
        ) : isLoadError ? (
          <div className="flex flex-1 flex-col gap-3 p-5" aria-live="polite">
            <StatusBanner variant="error" icon={<AlertTriangle aria-hidden="true" />}>
              {error}
            </StatusBanner>
            <Button variant="secondary" onClick={retry}>
              Reintentar
            </Button>
          </div>
        ) : isUnavailable ? (
          <div className="flex flex-1 flex-col gap-3 p-5" aria-live="polite">
            <StatusBanner variant="warning" icon={<AlertTriangle aria-hidden="true" />}>
              Esta jornada ya no está disponible para descargar o compartir.
            </StatusBanner>
            <p className="text-xs leading-relaxed text-text-secondary">
              Puede haber sido eliminada o reemplazada desde otro dispositivo.
            </p>
          </div>
        ) : receiptData ? (
          <>
            <ReceiptContent data={receiptData} elementId={RECEIPT_ELEMENT_ID} />

            <div className="flex shrink-0 flex-col gap-2 border-t border-border-subtle p-4">
              {actionError && (
                <StatusBanner variant="error" icon={<AlertTriangle aria-hidden="true" />}>
                  {actionError}
                </StatusBanner>
              )}
              <Button
                onClick={() => void handleExport('pdf')}
                disabled={isBusy || !canExport}
                className="flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                {exportLabel('Descargar PDF')}
              </Button>
              <Button
                variant="secondary"
                onClick={() => void handleExport('share')}
                disabled={isBusy || !canExport}
                className="flex items-center justify-center gap-2"
              >
                <Share2 className="h-4 w-4" aria-hidden="true" />
                {exportLabel('Compartir')}
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={isBusy || !canExport}
                className="flex items-center justify-center gap-2"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Eliminar jornada
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}

export default JourneyDetailModal
