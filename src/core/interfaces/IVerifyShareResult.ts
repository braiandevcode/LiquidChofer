import type { IJourneyDetail } from "../types/journeyHistory"

// RESULTADO DE LA VERIFICACION PREVIA A EXPORTAR.
export interface IVerifyShareResult {
  ok: boolean
  journey: IJourneyDetail | null
  verificationCode: string | null
  message: string
}