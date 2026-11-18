import type { IShareState } from "../interfaces/IShareState";

export const INITIAL_STATE: IShareState = {
  key: null,
  viewState: 'ready',
  shareable: false,
  journey: null,
  verificationCode: null,
  error: '',
}