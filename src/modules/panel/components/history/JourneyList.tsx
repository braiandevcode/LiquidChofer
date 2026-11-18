import type { ReactNode } from 'react'
import JourneyCard from './JourneyCard'
import type { IJourneyHistory } from '../../../../core/types/journeyHistory'

interface IJourneyListProps {
  journeys: IJourneyHistory[]
  onOpen: (journeyId: string) => void
}

const JourneyList = ({ journeys, onOpen }: IJourneyListProps): ReactNode => (
  <ul className="grid gap-3 sm:grid-cols-2">
    {journeys.map((journey) => (
      <li key={journey.id}>
        <JourneyCard journey={journey} onOpen={onOpen} />
      </li>
    ))}
  </ul>
)

export default JourneyList
