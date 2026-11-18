import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  linkWithCredential,
  linkWithPopup,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  verifyBeforeUpdateEmail,
  updatePassword,
  type AuthCredential,
  type User,
  type UserCredential,
  type ActionCodeSettings,
} from 'firebase/auth'
import { APP_URL } from '../../shared/lib/appUrl'
import { auth } from '../config/firebase'

import {
  API_FETCH,
  ApiError,
  clearAccessToken,
  getAccessToken,
  refreshAccessToken,
  setAccessToken,
} from './api'
import { TO_USER_ERROR } from './apiMessages'
import { EmailNotVerifiedError } from '../types/EmailNotVerifiedError'
import type { IFirebaseError } from '../interfaces/IFirebaseError'
import type { IUserInfo } from '../interfaces/IUserInfo'
import type { IBackendUser } from '../interfaces/IBackendUser'
import type { IBackendLoginResponse } from '../interfaces/IBackendLoginResponse'
import type { TAuthStateListener } from '../types/TAuthStateListener'

// ERROR TIPADO QUE AVISA QUE EL CORREO YA EXISTE CON OTRO PROVEEDOR Y HAY QUE VINCULARLO
export class AccountLinkRequiredError extends Error {
  readonly email: string
  readonly pendingCredential: AuthCredential

  constructor(email: string, pendingCredential: AuthCredential) {
    super('Ya existe una cuenta con este correo. Ingresá tu contraseña para vincular Google.')
    this.name = 'AccountLinkRequiredError'
    this.email = email
    this.pendingCredential = pendingCredential
  }
}

// ERROR DE COLISION ENTRE METODOS DE ACCESO (EL CORREO YA EXISTE CON OTRO PROVEEDOR)
class AccountConflictError extends Error {
  constructor() {
    super('Ya existe una cuenta con este correo. Iniciá sesión con tu método original o vinculá Google.')
    this.name = 'AccountConflictError'
  }
}

// INTERFAZ DEL ERROR DE COLISION CON LOS DATOS EXTRA QUE ENTREGA FIREBASE
interface IFirebaseCollisionError extends IFirebaseError {
  customData?: {
    email?: unknown
    credential?: unknown
  }
}

// VERIFICO SI EL ERROR INDICA QUE HAY QUE VINCULAR OTRO PROVEEDOR AL MISMO CORREO
const IS_ACCOUNT_LINK_REQUIRED = (error: unknown): error is IFirebaseCollisionError =>
  error instanceof Error &&
  'code' in error &&
  (error as IFirebaseError).code === 'auth/account-exists-with-different-credential'

// CONSTRUYO EL ERROR TIPADO CON EL CORREO Y LA CREDENCIAL PENDIENTE DE GOOGLE
const BUILD_ACCOUNT_LINK_ERROR = (error: unknown): AccountLinkRequiredError | null => {
  if (!IS_ACCOUNT_LINK_REQUIRED(error)) return null // NO ES UNA COLISION DE PROVEEDORES
  const email: string = typeof error.customData?.email === 'string' ? error.customData.email : ''
  const credential: AuthCredential | null = GoogleAuthProvider.credentialFromError(
    error as Parameters<typeof GoogleAuthProvider.credentialFromError>[0],
  )
  if (!email || !credential) return null // SIN DATOS SUFICIENTES PARA VINCULAR
  return new AccountLinkRequiredError(email, credential)
}

// INTERMEDIARIO QUE TRADUCE LOS CODIGOS DE ERROR DE FIREBASE A MENSAJES EN ESPAÑOL
const ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'Credenciales incorrectas. Verificá tus datos.',
  'auth/user-not-found': 'No existe una cuenta con este correo.',
  'auth/wrong-password': 'La contraseña es incorrecta.',
  'auth/email-already-in-use': 'Este correo ya está registrado.',
  'auth/weak-password': 'La contraseña debe tener al menos 8 caracteres.',
  'auth/invalid-email': 'El formato del correo no es válido.',
  'auth/user-disabled': 'Esta cuenta fue deshabilitada.',
  'auth/too-many-requests': 'Demasiados intentos. Probá de nuevo más tarde.',
  'auth/network-request-failed': 'Error de conexión. Revisá tu internet.',
  'auth/popup-closed-by-user': 'Cerraste la ventana de Google antes de terminar.',
  'auth/cancelled-popup-request': 'La solicitud de Google fue cancelada.',
  'auth/account-exists-with-different-credential': 'Ya existe una cuenta con este correo usando otro método de inicio de sesión.',
  'auth/credential-already-in-use': 'Esta cuenta de Google ya está vinculada a otro usuario.',
  'auth/provider-already-linked': 'Esta cuenta ya tiene Google vinculado.',
  'auth/requires-recent-login': 'Por seguridad, volvé a iniciar sesión antes de vincular Google.',
}

// VUELVE AL USUARIO DESPUES DE VERIFICAR EL CORREO O RESTABLECER LA CONTRASEÑA
const ACTION_CODE_SETTINGS: ActionCodeSettings = {
  url: APP_URL('/login'),
  handleCodeInApp: false,
}

// CONVIERTO UN USUARIO DE FIREBASE AL MODELO INTERNO DE LA APP
const MAP_FIREBASE_USER = (user: User): IUserInfo => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  photoURL: user.photoURL,
})

// CONVIERTO EL PERFIL DEL BACKEND AL MODELO INTERNO USANDO firebaseUid COMO uid
const MAP_BACKEND_USER = (user: IBackendUser): IUserInfo => ({
  uid: user.firebaseUid,
  email: user.email || null,
  displayName: user.displayName,
  photoURL: user.photoUrl,
  hasPassword: user.hasPassword
})

// EXTRAIGO EL MENSAJE AMIGABLE A PARTIR DE UN ERROR DESCONOCIDO
const RESOLVE_ERROR_MESSAGE = (error: unknown): string => {
  if (error instanceof AccountConflictError) return error.message
  if (error && typeof error === 'object' && 'code' in error) {
    const firebaseError = error as IFirebaseError
    const translated: string | undefined = ERROR_MESSAGES[firebaseError.code]
    if (translated) return translated
  }
  return TO_USER_ERROR(error, 'Ocurrió un error inesperado. Intentá de nuevo.')
}

// INTERCAMBIO EL ID TOKEN DE FIREBASE POR LA SESION DEL BACKEND (ACCESS + REFRESH)
const EXCHANGE_FIREBASE_TOKEN = async (firebaseUser: User): Promise<IUserInfo> => {
  const idToken: string = await firebaseUser.getIdToken()
  const response = await API_FETCH<IBackendLoginResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ idToken }),
  })
  setAccessToken(response.accessToken) // GUARDO EL ACCESS TOKEN SOLO EN MEMORIA
  return MAP_BACKEND_USER(response.user)
}

// PROCESO EL RESULTADO DE UNA CREDENCIAL, LO INTERCAMBIA CON EL BACKEND Y DEVUELVO LA INFO
const HANDLE_CREDENTIAL_RESULT = async (credential: UserCredential): Promise<IUserInfo> =>
  EXCHANGE_FIREBASE_TOKEN(credential.user)

// INICIO SESION CON CORREO Y CONTRASEÑA
export const signInWithEmail = async (email: string, password: string): Promise<IUserInfo> => {
  try {
    const credential: UserCredential = await signInWithEmailAndPassword(auth, email, password)
    try {
      return await HANDLE_CREDENTIAL_RESULT(credential); // DEVUELVO LA INFO DEL USUARIO LOGEADO
    } catch (error) {
      await signOut(auth); // EL BACKEND RECHAZO: NO DEJO SESION DE FIREBASE ABIERTA
      if (error instanceof ApiError && error.status === 403) {
        throw new EmailNotVerifiedError(email) // 403 = CORREO SIN VERIFICAR
      }
      throw error;
    }
  } catch (error) {
    if (error instanceof EmailNotVerifiedError) throw error // NO LO TRADUZCO A UN ERROR GENERICO
    throw new Error(RESOLVE_ERROR_MESSAGE(error), { cause: error })
  }
}

export const signUpWithEmail = async (email: string, password: string): Promise<IUserInfo> => {
  let credential: UserCredential
  try {
    credential = await createUserWithEmailAndPassword(auth, email, password)
  } catch (error) {
    throw new Error(RESOLVE_ERROR_MESSAGE(error), { cause: error }) // LANZO ERROR TRADUCIDO AL ESPAÑOL
  }

  try {
    await sendEmailVerification(credential.user, ACTION_CODE_SETTINGS) // ENVIO EL LINK DE VERIFICACION AL CORREO
  } catch {
    // SI FALLA EL ENVIO, LA CUENTA YA EXISTE (SE PUEDE REENVIAR DESPUES)
  }

  await signOut(auth) // NO DEJO SESION DE FIREBASE ABIERTA SIN VERIFICAR
  throw new EmailNotVerifiedError(email) // LA UI MUESTRA "REVISA TU CORREO"
}

// REENVIO EL CORREO DE VERIFICACION: INICIO SESION, ENVIO Y CIERRO SESION DE NUEVO
export const resendVerificationEmail = async (email: string, password: string): Promise<void> => {
  try {
    const credential: UserCredential = await signInWithEmailAndPassword(auth, email, password)
    try {
      await sendEmailVerification(credential.user, ACTION_CODE_SETTINGS) // ENVIO EL LINK AL CORREO
    } finally {
      await signOut(auth) // CIERRO LA SESION AUNQUE FALLE EL ENVIO
    }
  } catch (error) {
    throw new Error(RESOLVE_ERROR_MESSAGE(error), { cause: error }) // LANZO ERROR TRADUCIDO AL ESPAÑOL
  }
}

// INICIO SESION CON LA CUENTA DE GOOGLE. SI YA HAY SESION VINCULO EL PROVEEDOR EN VEZ DE CREAR OTRO USUARIO
export const signInWithGoogle = async (): Promise<IUserInfo> => {
  const provider: GoogleAuthProvider = new GoogleAuthProvider()
  const currentUser: User | null = auth.currentUser
  try {
    if (currentUser) {
      const linked: UserCredential = await linkWithPopup(currentUser, provider)
      return await EXCHANGE_FIREBASE_TOKEN(linked.user) // CONSERVO EL UID DEL USUARIO ACTUAL
    }
    const credential: UserCredential = await signInWithPopup(auth, provider)
    try {
      return await HANDLE_CREDENTIAL_RESULT(credential) // DEVUELVO LA INFO DEL USUARIO DE GOOGLE
    } catch (error) {
      // SI EL BACKEND RECHAZA EL INTERCAMBIO, CIERRO LA SESION NUEVA DE FIREBASE
      await signOut(auth)
      if (error instanceof ApiError && error.status === 409) {
        throw new AccountConflictError()
      }
      throw error // PROPAGO EL ERROR ORIGINAL DEL BACKEND
    }
  } catch (error) {
    const linkError: AccountLinkRequiredError | null = BUILD_ACCOUNT_LINK_ERROR(error)
    if (linkError) throw linkError // EL LOGIN PAGE PIDE LA CONTRASEÑA PARA VINCULAR
    throw new Error(RESOLVE_ERROR_MESSAGE(error), { cause: error }) // LANZO ERROR TRADUCIDO AL ESPAÑOL
  }
}

// INDICO SI EL USUARIO ACTUAL TIENE PROVEEDOR DE CONTRASEÑA (SOLO ESOS PUEDEN CAMBIAR EL CORREO)
export const hasPasswordProvider = (): boolean =>
  auth.currentUser?.providerData.some((provider) => provider.providerId === 'password') ?? false

// INICIO SESION CON LA CONTRASEÑA ACTUAL, LA CAMBIO Y CIERRO SESION DE FIREBASE
export const changePassword = async (
  currentEmail: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> => {
  if (newPassword === currentPassword) {
    throw new Error('La nueva contraseña debe ser distinta a la actual.')
  }

  try {
    const credential: UserCredential = await signInWithEmailAndPassword(auth, currentEmail, currentPassword) // VALIDA LA CONTRASEÑA ACTUAL
    try {
      await updatePassword(credential.user, newPassword) // GUARDA LA NUEVA CONTRASEÑA EN FIREBASE
    } finally {
      await signOut(auth) // NO DEJO SESION DE FIREBASE ABIERTA (LA SESION REAL ES EL ACCESS TOKEN EN MEMORIA)
    }
  } catch (error) {
    throw new Error(RESOLVE_ERROR_MESSAGE(error), { cause: error }) // ERROR TRADUCIDO AL ESPAÑOL
  }
}

// REAUTENTICO (CONTRASEÑA O GOOGLE), ELIMINO LA CUENTA EN EL BACKEND Y CIERRO SESION DE FIREBASE
export const deleteAccount = async (
  currentEmail: string,
  hasPassword: boolean,
  password: string,
): Promise<void> => {
  try {
    // CON CONTRASEÑA: VALIDO CON EMAIL + CONTRASEÑA. SOLO GOOGLE: POPUP DE GOOGLE.
    const credential: UserCredential = hasPassword
      ? await signInWithEmailAndPassword(auth, currentEmail, password)
      : await signInWithPopup(auth, new GoogleAuthProvider())

    try {
      const idToken: string = await credential.user.getIdToken() // TOKEN RECIEN EMITIDO (auth_time RECIENTE)
      await API_FETCH<void>('/api/v1/auth/account', {
        method: 'DELETE',
        body: JSON.stringify({ idToken }),
      })
      clearAccessToken() // EL BACKEND YA REVOCO EL REFRESH Y LIMPIO LA COOKIE
    } finally {
      await signOut(auth) // NO DEJO SESION DE FIREBASE ABIERTA
    }
  } catch (error) {
    throw new Error(RESOLVE_ERROR_MESSAGE(error), { cause: error }) // ERROR TRADUCIDO AL ESPAÑOL
  }
}

// INICIO SESION CON EL CORREO ACTUAL + CONTRASEÑA, ENVIO EL LINK AL CORREO NUEVO Y CIERRO SESION DE FIREBASE
export const requestEmailChange = async (
  currentEmail: string,
  currentPassword: string,
  newEmail: string,
): Promise<void> => {
  const normalizedEmail: string = newEmail.trim().toLowerCase()
  if (normalizedEmail === currentEmail.toLowerCase()) {
    throw new Error('El nuevo correo es igual al actual.')
  }

  try {
    const credential: UserCredential = await signInWithEmailAndPassword(auth, currentEmail, currentPassword) // VALIDA LA CONTRASEÑA
    try {
      await verifyBeforeUpdateEmail(credential.user, normalizedEmail, ACTION_CODE_SETTINGS) // LINK AL CORREO NUEVO
    } finally {
      await signOut(auth) // NO DEJO SESION DE FIREBASE ABIERTA (LA SESION REAL ES EL ACCESS TOKEN EN MEMORIA)
    }
  } catch (error) {
    throw new Error(RESOLVE_ERROR_MESSAGE(error), { cause: error }) // ERROR TRADUCIDO AL ESPAÑOL
  }
}

// VINCULO LA CREDENCIAL PENDIENTE DE GOOGLE AL USUARIO MANUAL Y DEVUELVO SU PERFIL
export const resolveGoogleAccountLink = async (
  email: string,
  password: string,
  pendingCredential: AuthCredential,
): Promise<IUserInfo> => {
  try {
    const credential: UserCredential = await signInWithEmailAndPassword(auth, email, password)
    const linked: UserCredential = await linkWithCredential(credential.user, pendingCredential)
    return await EXCHANGE_FIREBASE_TOKEN(linked.user) // MANTENGO EL UID ORIGINAL DE LA CUENTA MANUAL
  } catch (error) {
    throw new Error(RESOLVE_ERROR_MESSAGE(error), { cause: error }) // LANZO ERROR TRADUCIDO AL ESPAÑOL
  }
}

// ENVIO EL CORREO PARA RESTABLECER LA CONTRASEÑA
export const sendPasswordReset = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email, ACTION_CODE_SETTINGS) // FIREBASE ENVIA EL LINK AL CORREO
  } catch (error) {
    const code: string | undefined = error && typeof error === 'object' && 'code' in error ? (error as IFirebaseError).code : undefined
    if (code === 'auth/user-not-found') return // NO REVELO SI EL CORREO EXISTE O NO
    throw new Error(RESOLVE_ERROR_MESSAGE(error), { cause: error }) // LANZO ERROR TRADUCIDO AL ESPAÑOL
  }
}

// CIERRO SOLO LA SESION DE FIREBASE (SIN LLAMAR AL BACKEND).
// LO USO CUANDO LA SESION DEL BACKEND YA NO ES RENOVABLE.
export const signOutFirebaseSession = async (): Promise<void> => {
  await signOut(auth)
}

// CIERRO LA SESION DEL USUARIO ACTUAL (BACKEND + FIREBASE)
export const signOutUser = async (): Promise<void> => {
  try {
    if (getAccessToken()) {
      await API_FETCH<void>('/api/v1/auth/logout', { method: 'POST' }) // REVOCO EL REFRESH Y LIMPIO LA COOKIE
    }
  } catch {
    // CIERRO IGUAL LA SESION LOCAL AUNQUE EL BACKEND NO RESPONDA
  } finally {
    clearAccessToken() // BORRO EL ACCESS TOKEN EN MEMORIA
  }
  await signOut(auth) // DESCONECTO AL USUARIO DE FIREBASE
}

// RENUEVO LA SESION CON LA COOKIE lqc_rt Y VALIDO EL PERFIL CON EL ACCESS TOKEN
export const fetchSession = async (): Promise<IUserInfo | null> => {
  const token: string | null = await refreshAccessToken() // ROTA EL REFRESH Y GUARDA EL ACCESS EN MEMORIA
  if (!token) return null // SIN REFRESH VALIDO NO HAY SESION

  try {
    const response = await API_FETCH<{ user: IBackendUser }>('/api/v1/auth/me', {}, false)
    return MAP_BACKEND_USER(response.user)
  } catch {
    clearAccessToken() // SIN ACCESO AL BACKEND SE ASUME SESION INEXISTENTE
    return null
  }
}

// EDITO EL NOMBRE VISIBLE EN EL BACKEND Y DEVUELVO EL PERFIL ACTUALIZADO
export const updateProfileName = async (displayName: string): Promise<IUserInfo> => {
  try {
    const response: { user: IBackendUser } = await API_FETCH<{ user: IBackendUser }>('/api/v1/auth/me', {
      method: 'PATCH',
      body: JSON.stringify({ displayName }),
    })
    return MAP_BACKEND_USER(response.user) // INCLUYE hasPassword, ASI NO SE PIERDE
  } catch (error) {
    throw new Error(RESOLVE_ERROR_MESSAGE(error), { cause: error }) // MENSAJE DEL BACKEND O TRADUCIDO
  }
}

// DEVUELVO EL USUARIO ACTUAL SIN SUSCRIPCION O NULL SI NO HAY SESION
export const getCurrentUser = (): IUserInfo | null => {
  const currentUser: User | null = auth.currentUser
  if (!currentUser) return null // NO HAY SESION ACTIVA
  return MAP_FIREBASE_USER(currentUser) // CONVIERTO AL MODELO INTERNO
}

// ME SUSCRIBO A LOS CAMBIOS DE ESTADO DE AUTENTICACION Y DEVUELVO LA FUNCION DE DESUSCRIPCION
export const onAuthStateChangedListener = (listener: TAuthStateListener): (() => void) =>
  onAuthStateChanged(auth, (user: User | null) => {
    listener(user ? MAP_FIREBASE_USER(user) : null) // NOTIFICO AL LISTENER CON LA INFO O NULL
  })