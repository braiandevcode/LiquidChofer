import { APP_URL_ORIGIN } from './appUrl'

export const VERIFICATION_BASE_URL: string = `${APP_URL_ORIGIN}/verificar`

export const VERIFICATION_URL = (code: string): string =>
  `${VERIFICATION_BASE_URL}/${encodeURIComponent(code)}`
