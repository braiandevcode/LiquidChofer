import { API_FETCH } from './api'
import { TO_USER_ERROR } from './apiMessages'
import type { IUserSettingsProfile, TUserSettingsPayload } from '../types/settings'

// TRADUZCO EL ERROR DEL BACKEND A UN MENSAJE COMPRENSIBLE PARA EL USUARIO
const RESOLVE_SETTINGS_ERROR = (error: unknown, fallback: string): Error =>
  new Error(TO_USER_ERROR(error, fallback), { cause: error })

// CARGO LOS PORCENTAJES POR DEFECTO DEL USUARIO
export const fetchUserSettings = async (): Promise<IUserSettingsProfile> => {
  try {
    return await API_FETCH<IUserSettingsProfile>('/api/v1/settings')
  } catch (error) {
    throw RESOLVE_SETTINGS_ERROR(error, 'No se pudieron cargar los porcentajes por defecto.')
  }
}

// GUARDO LOS PORCENTAJES POR DEFECTO DEL USUARIO (PUT REEMPLAZA TODOS LOS VALORES)
export const saveUserSettings = async (
  payload: TUserSettingsPayload,
): Promise<IUserSettingsProfile> => {
  try {
    return await API_FETCH<IUserSettingsProfile>('/api/v1/settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  } catch (error) {
    throw RESOLVE_SETTINGS_ERROR(error, 'No se pudieron guardar los porcentajes por defecto.')
  }
}
