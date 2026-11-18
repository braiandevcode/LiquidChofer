import { memo, useCallback, useState, type ReactNode } from 'react'
import { RotateCcw } from 'lucide-react'
import { FORMAT_JOURNEY_DATE, FORMAT_TIMESTAMP_DATE } from '../../../../shared/lib/journey'
import JourneyStat from '../../../../shared/ui/JourneyStat'
import Button from '../../../../shared/ui/Button'
import { FORMAT_ARS } from '../history/history.utils'
import type { IJourneyTrashItem } from '../../../../core/types/journeyHistory'

interface ITrashJourneyCardProps {
  journey: IJourneyTrashItem
  onRestore: (journey: IJourneyTrashItem) => void
}

// MUESTRO UNA JORNADA EN PAPELERA CON SU UNICA ACCION POSIBLE: RESTAURAR.
// NO USO UN <button> CONTENEDOR PORQUE DENTRO VA OTRO BOTON.
const TrashJourneyCardComponent = ({
  journey,
  onRestore,
}: ITrashJourneyCardProps): ReactNode => {
  const journeyLabel: string = FORMAT_JOURNEY_DATE(journey.journeyDate)
  // LA RETENCION ES DE 30 DIAS: VENCIDA, EL BACKEND YA NO LA RESTAURA.
  // TOMO LA HORA UNA VEZ AL MONTAR PARA NO LLAMAR AL RELOJ DURANTE EL RENDER.
  const [now] = useState<number>(() => Date.now())
  const isExpired: boolean =
    journey.purgeAt !== null && new Date(journey.purgeAt).getTime() <= now

  const retentionLabel: string = journey.purgeAt
    ? isExpired
      ? `Venció el ${FORMAT_TIMESTAMP_DATE(journey.purgeAt)}; ya no se puede restaurar.`
      : `Restaurable hasta el ${FORMAT_TIMESTAMP_DATE(journey.purgeAt)}.`
    : ''

  const handleRestore = useCallback((): void => onRestore(journey), [onRestore, journey])

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
