import type { IParsedError } from "../interfaces/IParsedError"

// URL base del backend NestJS. Se configura en VITE_API_URL o se asume local.
const API_BASE_URL: string = import.meta.env.PROD
  ? ''
  : (import.meta.env.VITE_API_URL ?? 'http://localhost:3000')

// Rutas publicas de sesion: no deben disparar el refresh automatico.
const LOGIN_PATH: string = '/api/v1/auth/login'
const REFRESH_PATH: string = '/api/v1/auth/refresh'

// Access token
let accessToken: string | null = null
// Promesa unica de refresh: varias requests con 401 comparten el mismo refresh.
let refreshPromise: Promise<string | null> | null = null

// Callback que registra AuthContext para limpiar el estado cuando la sesion vence.
let sessionExpiredHandler: (() => void) | null = null

// DEVUELVO EL ACCESS TOKEN ACTUAL (O NULL SI NO HAY SESION).
export const getAccessToken = (): string | null => accessToken

// GUARDO EL ACCESS TOKEN EN MEMORIA.
export const setAccessToken = (token: string | null): void => {
  accessToken = token
}

// LIMPIO EL ACCESS TOKEN EN MEMORIA.
export const clearAccessToken = (): void => {
  accessToken = null
}

// REGISTRO EL HANDLER QUE LIMPIA EL ESTADO DE SESION EN LA APP.
export const setSessionExpiredHandler = (handler: (() => void) | null): void => {
  sessionExpiredHandler = handler
}

// AVISO QUE LA SESION YA NO ES RENOVABLE.
const NOTIFY_SESSION_EXPIRED = (): void => {
  if (sessionExpiredHandler) sessionExpiredHandler()
}

// LLAMO AL ENDPOINT DE REFRESH CON LA COOKIE lqc_rt. No usa API_FETCH para evitar recursion.
const REFRESH_ACCESS_TOKEN = async (): Promise<string | null> => {
  try {
    const response: Response = await fetch(`${API_BASE_URL}${REFRESH_PATH}`, {
      method: 'POST',
      credentials: 'include', // ENVIO LA COOKIE
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) {
      accessToken = null
      NOTIFY_SESSION_EXPIRED()
      return null
    }
    const data = (await response.json()) as { accessToken?: unknown }
    if (typeof data.accessToken !== 'string' || data.accessToken.length === 0) {
      accessToken = null
      NOTIFY_SESSION_EXPIRED()
      return null
    }
    accessToken = data.accessToken
    return accessToken
  } catch {
    // SIN RESPUESTA O RESPUESTA INVALIDA: NO HAY SESION RENOVABLE.
    accessToken = null
    NOTIFY_SESSION_EXPIRED()
    return null
  }
}

// RENUEVO EL ACCESS TOKEN Y LO GUARDO EN MEMORIA.
// Single-flight: si varias requests reciben 401 a la vez, comparten el mismo refresh.
export const refreshAccessToken = (): Promise<string | null> => {
  if (refreshPromise) return refreshPromise
  refreshPromise = REFRESH_ACCESS_TOKEN().finally(() => {
    refreshPromise = null
  })
  return refreshPromise
}

// INDICO SI LA RUTA ES DE SESION Y NO DEBE REINTENTARSE CON REFRESH.
const IS_AUTH_PATH = (path: string): boolean =>
  path.startsWith(LOGIN_PATH) || path.startsWith(REFRESH_PATH)

// Error de red: no hubo respuesta del servicio (sin conexion, timeout, DNS, etc.).
export class NetworkError extends Error {
  constructor(cause?: unknown) {
    super('No se pudo conectar con el servicio.', { cause })
    this.name = 'NetworkError'
  }
}

// Error de API con codigo HTTP para poder distinguir (ej: 401 = sesion invalida).
// El mensaje interno NO se muestra al usuario: la UI lo traduce con TO_USER_ERROR.
// `code` y `payload` permiten reaccionar a errores de negocio (ej: JOURNEY_DATE_EXISTS).
export class ApiError extends Error {
  readonly status: number
  readonly code?: string
  readonly payload?: unknown

  constructor(message: string, status: number, code?: string, payload?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.payload = payload
  }
}

// Extraigo el mensaje, el codigo de negocio y el body completo del error.
// El mensaje interno se usa solo para diagnostico: nunca se renderiza tal cual en la interfaz.
const PARSE_ERROR_BODY = async (response: Response): Promise<IParsedError> => {
  try {
    const data = (await response.json()) as { message?: string | string[]; code?: string }
    const rawMessage: string | string[] | undefined = data.message
    const message: string = Array.isArray(rawMessage)
      ? (rawMessage[0] ?? `HTTP ${response.status}`)
      : (rawMessage ?? `HTTP ${response.status}`)
    return { message, code: data.code, payload: data }
  } catch {
    return { message: `HTTP ${response.status}`, payload: null }
  }
}

// CONSTRUYO LOS HEADERS CONSERVANDO LOS QUE RECIBA CADA LLAMADA.
const BUILD_HEADERS = (init: RequestInit, token: string | null): Headers => {
  const headers: Headers = new Headers(init.headers)
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  if (!headers.has('Accept')) headers.set('Accept', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  return headers
}

// Envoltura de fetch: adjunta el access token en memoria, envia la cookie de refresh,
// renueva la sesion una vez ante un 401 y parsea los errores del backend.
export const API_FETCH = async <T>(
  path: string,
  init: RequestInit = {},
  retryOnUnauthorized = true,
): Promise<T> => {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      credentials: 'include', // ENVIO LA COOKIE lqc_rt CUANDO CORRESPONDA
      headers: BUILD_HEADERS(init, accessToken),
    })
  } catch (cause) {
    throw new NetworkError(cause)
  }

  // ACCESS TOKEN VENCIDO: RENUEVO UNA SOLA VEZ Y REINTENTO LA REQUEST ORIGINAL.
  if (response.status === 401 && retryOnUnauthorized && !IS_AUTH_PATH(path)) {
    const nextToken: string | null = await refreshAccessToken()
    if (nextToken) return API_FETCH<T>(path, init, false)
  }

  if (!response.ok) {
    const parsedError: IParsedError = await PARSE_ERROR_BODY(response)
    throw new ApiError(parsedError.message, response.status, parsedError.code, parsedError.payload)
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}
