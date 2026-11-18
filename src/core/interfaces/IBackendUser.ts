// PERFIL QUE DEVUELVE EL BACKEND NESTJS EN /auth/login y /auth/me
export interface IBackendUser {
  id: number
  firebaseUid: string
  email: string
  displayName: string | null
  photoUrl: string | null
  createdAt: string
  hasPassword?: boolean
}