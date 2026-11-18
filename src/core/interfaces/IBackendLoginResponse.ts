import type { IBackendUser } from "./IBackendUser"

// RESPUESTA DEL LOGIN: ACCESS TOKEN EN MEMORIA + PERFIL DEL USUARIO
export interface IBackendLoginResponse {
  accessToken: string
  user: IBackendUser
  message?: string
}