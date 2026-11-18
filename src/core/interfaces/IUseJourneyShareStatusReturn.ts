import type { IJourneyDetail } from "../types/journeyHistory"
import type { TJourneyShareViewState } from "../types/TJourneyShareViewState"
import type { IVerifyShareResult } from "./IVerifyShareResult"

export interface IUseJourneyShareStatusReturn {
  viewState: TJourneyShareViewState
  shareable: boolean
  journey: IJourneyDetail | null
  verificationCode: string | null
  error: string
  retry: () => void
  verify: () => Promise<IVerifyShareResult>
}