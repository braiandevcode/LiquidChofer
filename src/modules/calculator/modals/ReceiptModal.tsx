import { useCallback, useEffect, useMemo, useState, type MouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Download, Share2, X } from 'lucide-react';
import useCalculatorContext from '../../../core/context/useCalculatorContext';
import { calculateResult } from '../../../core/hooks/useCalculator';
import { useJourneyShareStatus } from '../../../core/hooks/useJourneyShareStatus';
import { CALCULATOR_RECEIPT_DATA } from '../lib/receiptData';
import { JOURNEY_RECEIPT_DATA } from '../../../shared/lib/journeyReceipt';
import { VERIFICATION_URL } from '../../../shared/lib/verification';
import { useFocusTrap } from '../../../shared/hooks/useFocusTrap';
import { useReceiptExport } from '../../../core/hooks/useReceiptExport';
import Button from '../../../shared/ui/Button';
import IconButton from '../../../shared/styles/IconButton';
import LoadingDots from '../../../shared/styles/LoadingDots';
import StatusBanner from '../../../shared/styles/StatusBanner';
import ReceiptContent from '../components/ReceiptContent';
import type { ICalculatorResult } from '../../../core/interfaces/ICalculatorResult';

interface ReceiptModalProps {
  isOpen: boolean;
  // Si hay id, el recibo sale del backend (share-status). Sin id es una vista previa sin guardar.
  journeyId?: string | null;
  onClose: () => void;
  // Solo lectura: se usa desde el banner del chat, sin descargas ni compartir.
  readOnly?: boolean;
}

type TExportStage = 'idle' | 'checking' | 'exporting';

const RECEIPT_ELEMENT_ID: string = 'receipt-content';
const MODAL_TITLE_ID: string = 'receipt-modal-title';

const BODY_BLOCK_SCROLL = (isOpen: boolean): (() => void) => {
  if (isOpen) {
    document.body.classList.add('overflow-hidden');
    window.dispatchEvent(new CustomEvent('modal:open'));
  } else {
    document.body.classList.remove('overflow-hidden');
  }
  return () => document.body.classList.remove('overflow-hidden');
};

const HANDLE_ESCAPE = (onClose: () => void) => (e: KeyboardEvent): void => {
  if (e.key === 'Escape') {
    onClose();
  }
};

const ReceiptModal = ({ isOpen, journeyId = null, onClose, readOnly = false }: ReceiptModalProps): ReactNode => {
  const { state } = useCalculatorContext();
  const result: ICalculatorResult = useMemo(() => calculateResult(state), [state]);
  const calculatorData = useMemo(
    () => CALCULATOR_RECEIPT_DATA(state, result),
    [state, result],
  );
  const {
    viewState,
    shareable,
    journey,
    verificationCode,
    error,
    retry,
    verify,
  } = useJourneyShareStatus(journeyId, isOpen);
  const { shareImage, downloadPDF } = useReceiptExport();
  const modalRef = useFocusTrap(isOpen);
  const [exportStage, setExportStage] = useState<TExportStage>('idle');
  const [actionError, setActionError] = useState<string>('');

  const isSaved: boolean = journeyId !== null;
  const isBusy: boolean = exportStage !== 'idle';
  const isVerifying: boolean = isSaved && viewState === 'loading';
  const isUnavailable: boolean = isSaved && viewState === 'ready' && !shareable;
  const isLoadError: boolean = isSaved && viewState === 'error';
  const canExport: boolean = isSaved && shareable && journey !== null;

  const receiptData = useMemo(() => {
    if (isSaved) return journey ? JOURNEY_RECEIPT_DATA(journey, verificationCode) : null;
    return calculatorData;
  }, [isSaved, journey, verificationCode, calculatorData]);

  const handleClose = useCallback((): void => {
    if (!isBusy) onClose();
  }, [isBusy, onClose]);

  const HANDLE_SCROLL_LOCK = (): (() => void) => BODY_BLOCK_SCROLL(isOpen);

  useEffect(HANDLE_SCROLL_LOCK, [isOpen]);

  const HANDLE_KEYBOARD_CLOSE = (): (() => void) | undefined => {
    if (!isOpen) return undefined;
    const ON_ESCAPE = HANDLE_ESCAPE(handleClose);
    document.addEventListener('keydown', ON_ESCAPE);
    return () => document.removeEventListener('keydown', ON_ESCAPE);
  };

  useEffect(HANDLE_KEYBOARD_CLOSE, [isOpen, handleClose]);

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // ANTES DE GENERAR EL ARCHIVO VUELVO A CONSULTAR share-status.
  // SI LA JORNADA SE ELIMINO O REEMPLAZO DESDE OTRO DISPOSITIVO, NO EXPORTO NADA.
  const handleExport = async (kind: 'pdf' | 'share'): Promise<void> => {
    if (!journeyId || isBusy) return;

    setActionError('');
    setExportStage('checking');

    const verification = await verify();
    if (!verification.ok) {
      setActionError(verification.message);
      setExportStage('idle');
      return;
    }

    setExportStage('exporting');
    try {
      if (kind === 'share') {
        await shareImage(
          RECEIPT_ELEMENT_ID,
          verificationCode ? VERIFICATION_URL(verificationCode) : undefined,
        );
      } else {
        const journeyDate: string = verification.journey?.journeyDate ?? 'resumen';
        await downloadPDF(RECEIPT_ELEMENT_ID, `jornada-${journeyDate}.pdf`);
      }
      onClose();
    } catch (cause) {
      // SI EL USUARIO CANCELA EL DIALOGO DE COMPARTIR NO ES UN ERROR REAL.
      if (!(cause instanceof Error) || cause.name !== 'AbortError') {
        setActionError('No se pudo generar el recibo. Probá de nuevo.');
      }
    } finally {
      setExportStage('idle');
    }
  };

  if (!isOpen) return null;

  const exportLabel = (idleLabel: string): string => {
    if (exportStage === 'checking') return 'Verificando...';
    if (exportStage === 'exporting') return 'Exportando...';
    return idleLabel;
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 animate-fade-in" onClick={handleBackdropClick}>
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={MODAL_TITLE_ID}
        className="relative w-full max-w-md rounded-2xl bg-bg-card border border-border-subtle shadow-xl max-h-[calc(100vh-2rem)] flex flex-col animate-scale-in print-white"
      >
        <div className="flex items-center justify-between border-b border-border-subtle p-4 shrink-0 no-print">
          <h2
            id={MODAL_TITLE_ID}
            className="text-lg font-bold text-text-primary font-display tracking-wide"
          >
            Recibo de Jornada
          </h2>
          <IconButton
            onClick={handleClose}
            ariaLabel="Cerrar"
            size="md"
            autoFocus
            className={isBusy ? 'pointer-events-none opacity-50' : ''}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </IconButton>
        </div>

        {isVerifying ? (
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
          <ReceiptContent data={receiptData} elementId={RECEIPT_ELEMENT_ID} />
        ) : null}

        {!readOnly && !isSaved && !result.isPercentValid && (
          <div className="mx-4 mb-2 p-3 rounded-xl bg-accent-red/10 border border-accent-red/30 flex items-start gap-2.5 shrink-0 no-print">
            <AlertTriangle
              className="h-5 w-5 text-accent-red flex-shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-bold text-accent-red font-display">
                Falta ajustar los %
              </span>
              <p className="text-xs text-text-secondary">
                Suma actual: {result.percentTotal}% — tiene que ser 100% para
                guardar la jornada.
              </p>
            </div>
          </div>
        )}

        {!readOnly && (!isSaved || canExport) && (
          <div className="flex flex-col gap-2 border-t border-border-subtle p-4 shrink-0 no-print">
            {!isSaved ? (
              <StatusBanner variant="info">
                Guardá la jornada para poder descargar o compartir el recibo.
              </StatusBanner>
            ) : (
              <>
                {actionError && (
                  <StatusBanner variant="error" icon={<AlertTriangle aria-hidden="true" />}>
                    {actionError}
                  </StatusBanner>
                )}
                <Button
                  variant="primary"
                  onClick={() => void handleExport('pdf')}
                  className="flex items-center justify-center gap-2"
                  disabled={isBusy}
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  {exportLabel('Descargar PDF')}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => void handleExport('share')}
                  className="flex items-center justify-center gap-2"
                  disabled={isBusy}
                >
                  <Share2 className="h-4 w-4" aria-hidden="true" />
                  {exportLabel('Compartir')}
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default ReceiptModal;
