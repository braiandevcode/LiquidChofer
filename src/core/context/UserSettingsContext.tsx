import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { fetchUserSettings, saveUserSettings } from '../services/settings.service'
import { useAuth } from './AuthContext'
import type {
  IUserSettingsContextType,
  IUserSettingsProfile,
  TUserSettingsPayload,
} from '../types/settings'

const UserSettingsContext = createContext<IUserSettingsContextType | null>(null)

// EXTRAIGO UN MENSAJE DE ERROR LEGIBLE PARA LA CARGA DE AJUSTES
const RESOLVE_LOAD_ERROR = (error: unknown): string =>
  error instanceof Error
    ? error.message
    : 'No se pudieron cargar los porcentajes por defecto.'

export const UserSettingsProvider = ({ children }: { children: ReactNode }): ReactNode => {
  const { user, authReady } = useAuth()
  const [settings, setSettings] = useState<IUserSettingsProfile | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [hasResolved, setHasResolved] = useState<boolean>(false)
  const [version, setVersion] = useState<number>(0)
  const [loadError, setLoadError] = useState<string>('')

  // CARGO LOS AJUSTES SIN SETEAR ESTADO SINCRONICAMENTE (EVITO RENDERS EN CASCADA)
  const loadSettings = useCallback(async (): Promise<void> => {
    try {
      const nextSettings: IUserSettingsProfile = await fetchUserSettings()
      setSettings(nextSettings)
      setLoadError('')
    } catch (error) {
      setLoadError(RESOLVE_LOAD_ERROR(error))
    } finally {
      setIsLoading(false)
      setHasResolved(true) // MARCO QUE YA INTENTE CARGAR LOS AJUSTES
      setVersion((previous) => previous + 1) // NUEVA VERSION PARA REFRESCAR EL FORMULARIO
    }
  }, [])

  // REINTENTO MANUAL: MUESTRO EL ESTADO DE CARGA ANTES DE VOLVER A CONSULTAR
  const reload = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    setLoadError('')
    await loadSettings()
  }, [loadSettings])

  // ESPERO LA SESION Y CARGO LOS AJUSTES UNA VEZ RESUELTA
  useEffect(() => {
    if (!authReady || !user) return

    let isActive: boolean = true
    void fetchUserSettings()
      .then((nextSettings: IUserSettingsProfile) => {
        if (!isActive) return
        setSettings(nextSettings)
        setLoadError('')
      })
      .catch((error: unknown) => {
        if (!isActive) return
        setLoadError(RESOLVE_LOAD_ERROR(error))
      })
      .finally(() => {
        if (!isActive) return
        setIsLoading(false)
        setHasResolved(true) // MARCO QUE YA INTENTE CARGAR LOS AJUSTES
        setVersion((previous) => previous + 1) // NUEVA VERSION PARA REFRESCAR EL FORMULARIO
      })

    return () => {
      isActive = false // EVITO SETEAR ESTADO SI EL COMPONENTE SE DESMONTA
    }
  }, [authReady, user])

  // GUARDO LOS AJUSTES Y ACTUALIZO EL ESTADO COMPARTIDO CON LA CALCULADORA
  const save = useCallback(
    async (payload: TUserSettingsPayload): Promise<IUserSettingsProfile> => {
      const savedSettings: IUserSettingsProfile = await saveUserSettings(payload)
      setSettings(savedSettings)
      setLoadError('')
      return savedSettings
    },
    [],
  )

  return (
    <UserSettingsContext.Provider
      value={{ settings, isLoading, hasResolved, version, loadError, reload, save }}
    >
      {children}
    </UserSettingsContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useUserSettings = (): IUserSettingsContextType => {
  const ctx = useContext(UserSettingsContext)
  if (!ctx) throw new Error('useUserSettings must be used within UserSettingsProvider')
  return ctx
}
