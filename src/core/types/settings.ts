import type { TCarOwner } from "./TCarOwner"

// PERFIL DE PORCENTAJES POR DEFECTO QUE DEVUELVE EL BACKEND
export interface IUserSettingsProfile {
  defaultAgencyPercent: number
  defaultDriverPercent: number
  defaultCarRented: boolean
  defaultCarOwner: TCarOwner,
  defaultCarPercent: number | null
}

// PAYLOAD QUE ENVIO AL BACKEND PARA GUARDAR LOS PORCENTAJES POR DEFECTO
export type TUserSettingsPayload = IUserSettingsProfile

// DATOS Y ACCIONES QUE COMPARTO ENTRE AJUSTES Y CALCULADORA
export interface IUserSettingsContextType {
  settings: IUserSettingsProfile | null
  isLoading: boolean
  hasResolved: boolean
  version: number
  loadError: string
  reload: () => Promise<void>
  save: (payload: TUserSettingsPayload) => Promise<IUserSettingsProfile>
}
