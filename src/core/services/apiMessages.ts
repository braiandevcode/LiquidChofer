import { ApiError, NetworkError } from './api'

const FALLBACK_MESSAGE: string = 'Algo salió mal. Intentá de nuevo.'
const CONNECTION_MESSAGE: string = 'No pudimos conectarnos. Revisá tu internet e intentá de nuevo.'
export const UNAVAILABLE_MESSAGE: string = 'Esta jornada ya no está disponible para descargar o compartir.'

// MENSAJES HUMANOS POR ESTADO HTTP. NUNCA SE MUESTRA EL TEXTO CRUDO DEL BACKEND.
const STATUS_MESSAGES: Record<number, string> = {
  400: 'Revisá los datos e intentá de nuevo.',
  401: 'Tu sesión no es válida. Volvé a ingresar.',
  403: 'No tenés permiso para hacer esto.',
  404: 'No encontramos lo que buscabas.',
  409: 'Ese dato ya está en uso.',
  422: 'Revisá los datos e intentá de nuevo.',
  429: 'Hiciste demasiados intentos. Esperá un momento.',
} as const

// TRADUZCO CUALQUIER ERROR A UN MENSAJE COMPRENSIBLE PARA EL USUARIO.
// EL DETALLE TECNICO QUEDA EN `cause` PARA DIAGNOSTICO, NUNCA EN PANTALLA.
export const TO_USER_ERROR = (error: unknown, fallback: string = FALLBACK_MESSAGE): string => {
  if (error instanceof NetworkError) return CONNECTION_MESSAGE
  if (error instanceof ApiError) {
    if (error.status >= 500) return 'Algo salió mal de nuestro lado. Probá en unos minutos.'
    return STATUS_MESSAGES[error.status] ?? fallback
  }
  if (error instanceof TypeError) return CONNECTION_MESSAGE
  return fallback
}
