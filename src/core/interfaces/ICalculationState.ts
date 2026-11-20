import type { TCalculationMissingField, TCalculationStatus } from "../types/TCalculation"
import type { ICalculationInput } from "./ICalculationInput"
import type { ICalculationResult } from "./ICalculationResult "

// Borrador y estado vigente del calculo dentro de una conversacion.
export interface ICalculationState {
  id: string
  status: TCalculationStatus
  missingFields: TCalculationMissingField[]
  input: Partial<ICalculationInput>
  result?: ICalculationResult
  updatedAt: string
  // Jornada activa que el backend resolvio para este calculo (fuente de verdad).
  savedJourneyId?: string | null
}