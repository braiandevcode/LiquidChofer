import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import {
  AccountLinkRequiredError,
  fetchSession,
  getCurrentUser,
  resolveGoogleAccountLink,
  signInWithEmail,
  signInWithGoogle,
  signOutUser,
  signUpWithEmail,
  updateProfileName,
} from '../services/auth.service'
import type { IAuthContextType } from '../interfaces/IAuthContextType'
import type { IUserInfo } from '../interfaces/IUserInfo'
import type { IPendingGoogleLink } from '../interfaces/IPendingGoogleLink'

const AuthContext = createContext<IAuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }): ReactNode => {
  const [user, setUser] = useState<IUserInfo | null>(() => getCurrentUser())
  const [authReady, setAuthReady] = useState<boolean>(false)
  const [pendingGoogleEmail, setPendingGoogleEmail] = useState<string | null>(null)
  const pendingGoogleLinkRef = useRef<IPendingGoogleLink | null>(null)

  // VALIDO LA SESION CONTRA EL BACKEND (COOKIE HTTP-ONLY) AL MONTAR LA APP
  const HANDLE_SESSION_CHECK = (): void => {
    void fetchSession()
      .then((nextUser) => {
        setUser(nextUser) // ACTUALIZO EL USUARIO SEGUN LO QUE DIGA EL BACKEND
      })
      .catch(() => {
        setUser(null) // SI EL BACKEND NO RESPONDE, NO HAY SESION VALIDA
      })
      .finally(() => {
        setAuthReady(true) // EL GUARD DE RUTAS PUBLICAS DEPENDE DE ESTO
      })
  }

  useEffect(HANDLE_SESSION_CHECK, [])

  const signInEmail = useCallback(async (email: string, password: string): Promise<void> => {
    const nextUser: IUserInfo = await signInWithEmail(email, password)
    setUser(nextUser) // LA SESION SE ESTABLECE AL RECIBIR EL PERFIL DEL BACKEND
  }, [])

  const updateName = useCallback(async (displayName: string): Promise<void> => {
    const nextUser: IUserInfo = await updateProfileName(displayName)
    setUser(nextUser) // ACTUALIZO EL USUARIO EN TODA LA APP
  }, [])

  const signUpEmail = useCallback(async (email: string, password: string): Promise<void> => {
    const nextUser: IUserInfo = await signUpWithEmail(email, password)
    setUser(nextUser) // LA SESION SE ESTABLECE AL RECIBIR EL PERFIL DEL BACKEND
  }, [])

  const signInGoogle = useCallback(async (): Promise<void> => {
    try {
      const nextUser: IUserInfo = await signInWithGoogle()
      setUser(nextUser) // LA SESION SE ESTABLECE AL RECIBIR EL PERFIL DEL BACKEND
    } catch (error) {
      if (error instanceof AccountLinkRequiredError) {
        pendingGoogleLinkRef.current = { email: error.email, credential: error.pendingCredential }
        setPendingGoogleEmail(error.email) // HABILITO LA UI PARA PEDIR LA CONTRASEÑA
      }
      throw error // PROPAGO EL ERROR PARA QUE EL LOGIN PAGE LO TRADUZCA
    }
  }, [])

  const completeGoogleLink = useCallback(async (password: string): Promise<void> => {
    const pending: IPendingGoogleLink | null = pendingGoogleLinkRef.current
    if (!pending) throw new Error('La vinculación ya no está disponible. Probá de nuevo.') // SIN CREDENCIAL NO CONTINUO
    const nextUser: IUserInfo = await resolveGoogleAccountLink(pending.email, password, pending.credential)
    setUser(nextUser) // LA CUENTA MANUAL QUEDA VINCULADA Y CONSERVA SU UID
    pendingGoogleLinkRef.current = null
    setPendingGoogleEmail(null)
  }, [])

  const cancelGoogleLink = useCallback((): void => {
    pendingGoogleLinkRef.current = null // DESCARTO LA CREDENCIAL PENDIENTE
    setPendingGoogleEmail(null)
  }, [])

  const signOut = useCallback(async (): Promise<void> => {
    await signOutUser() // LIMPIO LA COOKIE DEL BACKEND Y LA SESION DE FIREBASE
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        updateName,
        authReady,
        signInEmail,
        signUpEmail,
        signInGoogle,
        pendingGoogleEmail,
        completeGoogleLink,
        cancelGoogleLink,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): IAuthContextType => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}