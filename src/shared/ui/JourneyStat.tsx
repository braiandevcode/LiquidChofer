import type { ReactNode } from 'react'
import type { IJourneyStatProps } from '../interfaces/props/IJourneyStatProps'

// MUESTRO UN IMPORTE ETIQUETADO DEL RESUMEN DE UNA JORNADA (SOLO PRESENTACION).
const JourneyStat = ({ label, value, valueClassName }: IJourneyStatProps): ReactNode => (
  <div className="rounded-lg bg-bg-input/60 px-2 py-1.5">
    <p className="text-[10px] font-medium uppercase tracking-wide text-text-muted">{label}</p>
    <p className={`mt-0.5 truncate font-display text-sm font-bold ${valueClassName}`}>{value}</p>
  </div>
)

export default JourneyStat
