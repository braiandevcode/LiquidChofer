import { API_FETCH, ApiError } from './api'
import { TO_USER_ERROR } from './apiMessages'
import type {
  ICreateJourneyPayload,
  IJourneyDetail,
  IJourneyListResponse,
  IJourneyShareStatusResponse,
  IJourneyTrashListResponse,
  IJourneyVerificationResponse,
} from '../types/journeyHistory'

// TRADUZCO EL ERROR DEL BACKEND A UN MENSAJE COMPRENSIBLE PARA EL USUARIO
const RESOLVE_JOURNEY_ERROR = (error: unknown, fallback: string): Error =>
  new Error(TO_USER_ERROR(error, fallback), { cause: error })

// GUARDO UNA JORNADA CERRADA. El backend valida y calcula los importes definitivos.
export const createJourney = async (
  payload: ICreateJourneyPayload,
): Promise<IJourneyDetail> => {
  try {
    return await API_FETCH<IJourneyDetail>('/api/v1/journeys', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  } catch (error) {
    // EL CONFLICTO DE FECHA LO RESUELVE LA UI OFRECIENDO REEMPLAZAR. NO PIERDO EL CODIGO NI EL PAYLOAD.
    if (error instanceof ApiError && error.status === 409 && error.code === 'JOURNEY_DATE_EXISTS') {
      throw error
    }
    throw RESOLVE_JOURNEY_ERROR(error, 'No se pudo guardar la jornada.')
  }
}

// LISTO LAS JORNADAS GUARDADAS (SIN VALES), LA MAS RECIENTE PRIMERO.
export const fetchJourneys = async (
  limit = 20,
  offset = 0,
): Promise<IJourneyListResponse> => {
  try {
    return await API_FETCH<IJourneyListResponse>(
      `/api/v1/journeys?limit=${limit}&offset=${offset}`,
    )
  } catch (error) {
    throw RESOLVE_JOURNEY_ERROR(error, 'No se pudo cargar el historial.')
  }
}

// CARGO EL DETALLE DE UNA JORNADA CON SUS VALES.
export const fetchJourney = async (journeyId: string): Promise<IJourneyDetail> => {
  try {
    return await API_FETCH<IJourneyDetail>(`/api/v1/journeys/${journeyId}`)
  } catch (error) {
    throw RESOLVE_JOURNEY_ERROR(error, 'No se pudo cargar la jornada.')
  }
}

// CONSULTO SI UNA JORNADA PUEDE DESCARGARSE O COMPARTIRSE.
// SI YA NO EXISTE, LA TRATO COMO ELIMINADA: EL USUARIO NO PUEDE EXPORTARLA.
export const fetchJourneyShareStatus = async (
  journeyId: string,
): Promise<IJourneyShareStatusResponse> => {
  try {
    return await API_FETCH<IJourneyShareStatusResponse>(
      `/api/v1/journeys/${journeyId}/share-status`,
    )
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return { shareable: false, status: 'deleted' }
    }
    throw RESOLVE_JOURNEY_ERROR(error, 'No se pudo verificar la jornada.')
  }
}

// ELIMINO UNA JORNADA DEL HISTORIAL.
export const deleteJourney = async (journeyId: string): Promise<void> => {
  try {
    await API_FETCH<{ message: string }>(`/api/v1/journeys/${journeyId}`, {
      method: 'DELETE',
    })
  } catch (error) {
    throw RESOLVE_JOURNEY_ERROR(error, 'No se pudo eliminar la jornada.')
  }
}

// LISTO LAS JORNADAS EN PAPELERA (BORRADO LOGICO), LA ULTIMA ELIMINADA PRIMERO.
export const fetchTrash = async (
  limit = 20,
  offset = 0,
): Promise<IJourneyTrashListResponse> => {
  try {
    return await API_FETCH<IJourneyTrashListResponse>(
      `/api/v1/journeys/trash?limit=${limit}&offset=${offset}`,
    )
  } catch (error) {
    throw RESOLVE_JOURNEY_ERROR(error, 'No se pudo cargar la papelera.')
  }
}

// RESTAURO UNA JORNADA DE LA PAPELERA Y LA DEVUELVO AL HISTORIAL.
// CON replaceExisting=true EL BACKEND MANDA A PAPELERA LA VIGENTE DE ESA FECHA.
export const restoreJourney = async (
  journeyId: string,
  replaceExisting = false,
): Promise<void> => {
  try {
    await API_FETCH<{ message: string; id: string }>(
      `/api/v1/journeys/${journeyId}/restore`,
      {
        method: 'POST',
        body: JSON.stringify({ replaceExisting }),
      },
    )
  } catch (error) {
    // LA UI NECESITA DISTINGUIR EL CONFLICTO DE FECHA (409) Y LA JORNADA VENCIDA/AJENA (404).
    if (
      error instanceof ApiError &&
      ((error.status === 409 && error.code === 'JOURNEY_DATE_EXISTS') ||
        error.status === 404)
    ) {
      throw error
    }
    throw RESOLVE_JOURNEY_ERROR(error, 'No se pudo restaurar la jornada.')
  }
}

// VERIFICACION PUBLICA DE UNA CONSTANCIA. No requiere sesion.
// EL 404 SIGNIFICA "NO EXISTE" Y SE CONSERVA PARA QUE LA PAGINA LO DISTINGA DE UN ERROR REAL.
export const verifyJourneyCode = async (
  code: string,
): Promise<IJourneyVerificationResponse> => {
  try {
    return await API_FETCH<IJourneyVerificationResponse>(
      `/api/v1/verify/${encodeURIComponent(code)}`,
    )
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw RESOLVE_JOURNEY_ERROR(error, 'No se pudo verificar la constancia.')
  }
}
