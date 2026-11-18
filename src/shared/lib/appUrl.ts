// UNICA FUENTE DEL DOMINIO PUBLICO DE LA APP.
export const APP_URL_ORIGIN: string = (import.meta.env.VITE_URL_ORIGIN ?? '').replace(/\/$/, '')

export const APP_URL = (path: string): string =>
  `${APP_URL_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`
