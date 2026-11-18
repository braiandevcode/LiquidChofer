import type { ReactNode } from 'react'
import TrashJourneyCard from './TrashJourneyCard'
import type { IJourneyTrashItem } from '../../../../core/types/journeyHistory'

interface ITrashJourneyListProps {
  journeys: IJourneyTrashItem[]
  onRestore: (journey: IJourneyTrashItem) => void
}

// LISTO LAS JORNADAS DE LA PAPELERA EN UNA GRILLA RESPONSIVE (SOLO PRESENTACION).
const TrashJourneyList = ({
  journeys,
  onRestore,
}: ITrashJourneyListProps): ReactNode => (
  <ul className="grid gap-3 sm:grid-cols-2">
    {journeys.map((journey) => (
      <li key={journey.id}>
        <TrashJourneyCard journey={journey} onRestore={onRestore} />
      </li>
    ))}
  </ul>
)

export default TrashJourneyList
