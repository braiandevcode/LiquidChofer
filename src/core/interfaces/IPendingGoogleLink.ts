import type { AuthCredential } from "firebase/auth"

// GUARDO LA CREDENCIAL PENDIENTE DE GOOGLE MIENTRAS EL USUARIO CONFIRMA SU CONTRASEÑA
export interface IPendingGoogleLink {
  email: string
  credential: AuthCredential
}
