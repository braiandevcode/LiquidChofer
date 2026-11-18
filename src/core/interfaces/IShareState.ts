import type { IJourneyDetail } from "../types/journeyHistory"

export interface IShareState {
  // Clave de la consulta resuelta (id + reintento). Si no coincide, la UI sigue en loading.
  key: string | null
  viewState: 'ready' | 'error'
  shareable: boolean
  journey: IJourneyDetail | null
  verificationCode: string | null
  error: string
}