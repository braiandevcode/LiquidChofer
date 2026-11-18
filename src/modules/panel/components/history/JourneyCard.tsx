import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { FORMAT_JOURNEY_DATE } from '../../../../shared/lib/journey'
import JourneyStat from '../../../../shared/ui/JourneyStat'
import { FORMAT_ARS } from './history.utils'
import type { IJourneyHistory } from '../../../../core/types/journeyHistory'

interface IJourneyCardProps {
  journey: IJourneyHistory
  onOpen: (journeyId: string) => void
}

const JourneyCard = ({ journey, onOpen }: IJourneyCardProps): ReactNode => (
  <button
    type="button"
    onClick={() => onOpen(journey.id)}
    className="group w-full rounded-2xl border border-border-subtle bg-bg-card p-4 text-left transition-colors cursor-pointer hover:border-accent-violet/40 hover:bg-bg-hover focus:outline-none focus:ring-2 focus:ring-accent-violet/30"
    aria-label={`Ver jornada del ${FORMAT_JOURNEY_DATE(journey.journeyDate)}`}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate font-display text-sm font-bold text-text-primary">
          {FORMAT_JOURNEY_DATE(journey.journeyDate)}
        </p>
        <p className="mt-0.5 text-xs text-text-muted">
          Total facturado {FORMAT_ARS(journey.total)}
        </p>
      </div>
      <ChevronRight
        className="mt-0.5 h-4 w-4 shrink-0 text-text-muted transition-colors group-hover:text-accent-violet"
        aria-hidden="true"
      />
    </div>

    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
      <JourneyStat
        label="Ganancia"
        value={FORMAT_ARS(journey.adjustedTotal)}
        valueClassName="text-accent-teal"
      />
      <JourneyStat
        label="Agencia"
        value={FORMAT_ARS(journey.finalAgency)}
        valueClassName="text-accent-amber"
      />
      <JourneyStat
        label="Conductor"
        value={FORMAT_ARS(journey.driverAmount)}
        valueClassName="text-text-primary"
      />
      {journey.carRented && journey.carAmount !== null && (
        <JourneyStat
          label="Vehículo"
          value={FORMAT_ARS(journey.carAmount)}
          valueClassName="text-accent-blue"
        />
      )}
    </div>
  </button>
)

export default JourneyCard
