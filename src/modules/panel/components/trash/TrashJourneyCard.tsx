import { memo, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Check, Copy, ExternalLink, RotateCcw } from 'lucide-react'
import { FORMAT_JOURNEY_DATE, FORMAT_TIMESTAMP_DATE } from '../../../../shared/lib/journey'
import { VERIFICATION_URL } from '../../../../shared/lib/verification'
import JourneyStat from '../../../../shared/ui/JourneyStat'
import Button from '../../../../shared/ui/Button'
import { FORMAT_ARS } from '../history/history.utils'
import type { IJourneyTrashItem } from '../../../../core/types/journeyHistory'

interface ITrashJourneyCardProps {
  journey: IJourneyTrashItem
  onRestore: (journey: IJourneyTrashItem) => void
}

type TCopyState = 'idle' | 'copied' | 'error'

// MUESTRO UNA JORNADA EN PAPELERA: RESTAURAR Y, SI EL BACKEND LO EXPOSE, VERIFICAR.
// NO USO UN <button> CONTENEDOR PORQUE DENTRO HAY VARIOS BOTONES Y ENLACES.
const TrashJourneyCardComponent = ({
  journey,
  onRestore,
}: ITrashJourneyCardProps): ReactNode => {
  const journeyLabel: string = FORMAT_JOURNEY_DATE(journey.journeyDate)
  // LA RETENCION ES DE 30 DIAS: VENCIDA, EL BACKEND YA NO LA RESTAURA.
  // TOMO LA HORA UNA VEZ AL MONTAR PARA NO LLAMAR AL RELOJ DURANTE EL RENDER.
  const [now] = useState<number>(() => Date.now())
  const [copyState, setCopyState] = useState<TCopyState>('idle')
  const copyTimerRef = useRef<number>(0)
  const isExpired: boolean =
    journey.purgeAt !== null && new Date(journey.purgeAt).getTime() <= now

  const verificationUrl: string | null = journey.verificationCode
    ? VERIFICATION_URL(journey.verificationCode)
    : null

  const retentionLabel: string = journey.purgeAt
    ? isExpired
      ? `Venció el ${FORMAT_TIMESTAMP_DATE(journey.purgeAt)}; ya no se puede restaurar.`
      : `Restaurable hasta el ${FORMAT_TIMESTAMP_DATE(journey.purgeAt)}.`
    : ''

  useEffect((): (() => void) => (): void => window.clearTimeout(copyTimerRef.current), [])

  const handleRestore = useCallback((): void => onRestore(journey), [onRestore, journey])

  const handleCopy = useCallback((): void => {
    if (!verificationUrl) return

    const SET_COPY_STATE = (next: TCopyState): void => {
      setCopyState(next)
      window.clearTimeout(copyTimerRef.current)
      copyTimerRef.current = window.setTimeout(() => setCopyState('idle'), 2500)
    }

    if (!navigator.clipboard?.writeText) {
      SET_COPY_STATE('error')
      return
    }

    void navigator.clipboard.writeText(verificationUrl).then(
      () => SET_COPY_STATE('copied'),
      () => SET_COPY_STATE('error'),
    )
  }, [verificationUrl])

  return (
    <article className="rounded-2xl border border-border-subtle bg-bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-bold text-text-primary">{journeyLabel}</p>
          <p className="mt-0.5 text-xs text-text-muted">
            Eliminada el {FORMAT_TIMESTAMP_DATE(journey.deletedAt)}
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-accent-red/20 bg-accent-red/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-red">
          Eliminada
        </span>
      </div>

      <div className="mt-3">
        <JourneyStat
          label="Total"
          value={FORMAT_ARS(journey.total)}
          valueClassName="text-text-primary"
        />
      </div>

      {retentionLabel && (
        <p
          className={`mt-2 text-xs ${isExpired ? 'font-medium text-accent-red' : 'text-text-muted'}`}
        >
          {retentionLabel}
        </p>
      )}

      {verificationUrl && (
        <div className="mt-3 rounded-xl border border-border-subtle bg-bg-input/60 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
            Código de verificación
          </p>
          <p className="mt-0.5 select-all font-mono text-sm font-bold tracking-wider text-text-primary">
            {journey.verificationCode}
          </p>

          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              fullWidth={false}
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 px-3 py-2 text-xs"
            >
              {copyState === 'copied' ? (
                <Check className="h-3.5 w-3.5 text-accent-green" aria-hidden="true" />
              ) : (
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {copyState === 'copied' ? 'Copiado' : 'Copiar enlace'}
            </Button>

            <a
              href={verificationUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Verificar comprobante en una pestaña nueva"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border-subtle bg-bg-card px-3 py-2 text-xs font-semibold text-text-secondary transition-colors hover:border-border-emphasis hover:bg-bg-hover hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-violet/30"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              Verificar
            </a>
          </div>

          <span role="status" className="sr-only">
            {copyState === 'copied'
              ? 'Enlace copiado al portapapeles.'
              : copyState === 'error'
                ? 'No se pudo copiar el enlace.'
                : ''}
          </span>

          {copyState === 'error' && (
            <p className="mt-2 text-xs text-accent-red">
              No se pudo copiar. Abrí el enlace para verificarlo.
            </p>
          )}
        </div>
      )}

      <div className="mt-3">
        <Button
          variant="secondary"
          onClick={handleRestore}
          disabled={isExpired}
          aria-label={`Restaurar la jornada del ${journeyLabel}`}
          className="flex items-center justify-center gap-2"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Restaurar
        </Button>
      </div>
    </article>
  )
}

// EVITO RE-RENDERIZAR LAS TARJETAS QUE NO CAMBIARON CUANDO SE PAGINA O SE REFRESCA LA LISTA.
const TrashJourneyCard = memo(TrashJourneyCardComponent)

export default TrashJourneyCard
