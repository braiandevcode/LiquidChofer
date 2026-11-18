import { useReducer, useEffect, useMemo, useRef, type ReactNode } from 'react'
import { initialState } from '../config/calculates.config'
import calculatorReducer from '../reducer/calculate.reducer'
import { debounce } from '../../shared/lib/debounce'
import { HAS_ACTIVE_JOURNEY } from '../../shared/lib/journey'
import { CalculatorContext } from './calculatorContextValue'
import { loadUserState, saveUserState } from '../services/journey.service'
import { useAuth } from './AuthContext'
import { useUserSettings } from './UserSettingsContext'

import type { IUserSettingsProfile } from '../types/settings'
import type { ICalculatorState } from '../interfaces/ICalculatorState'
import type { ICalculatorPercentDefaults } from '../interfaces/ICalculatorPercentDefaults'

// INDICO SI LA JORNADA NO TIENE DATOS PROPIOS DEL USUARIO (SOLO PORCENTAJES)
const IS_PRISTINE = (state: ICalculatorState): boolean => !HAS_ACTIVE_JOURNEY(state)

export const CalculatorProvider = ({ children }: { children: ReactNode }): ReactNode => {
  const { user, authReady } = useAuth()
  const { settings, hasResolved } = useUserSettings()
  const [state, dispatch] = useReducer(calculatorReducer, initialState)
  const hasHydrated = useRef<boolean>(false)
  const isHydrating = useRef<boolean>(false)
  const stateRef = useRef<ICalculatorState>(state)
  const previousSettingsRef = useRef<IUserSettingsProfile | null>(null)

  // PORCENTAJES POR DEFECTO QUE VIENEN DE LOS AJUSTES DEL USUARIO
  const percentageDefaults: ICalculatorPercentDefaults = useMemo(() => ({
    agencyPercent: settings?.defaultAgencyPercent ?? initialState.agencyPercent,
    driverPercent: settings?.defaultDriverPercent ?? initialState.driverPercent,
    carPercent: settings?.defaultCarPercent ?? initialState.carPercent,
    carRented: settings?.defaultCarRented ?? initialState.carRented,
    carOwner: settings?.defaultCarOwner ?? initialState.carOwner,
  }), [settings])

  const percentageDefaultsRef = useRef<ICalculatorPercentDefaults>(percentageDefaults)

  // MANTENGO LOS ULTIMOS DEFAULTS PARA USARLOS SI TERMINA UNA CARGA EN CURSO
  useEffect(() => {
    percentageDefaultsRef.current = percentageDefaults
  }, [percentageDefaults])

  // GUARDO EL ESTADO DEL USUARIO EN EL BACKEND CON UN DEBOUNCE PARA NO SPAMEAR LA API
  const debouncedSave = useMemo(() => debounce((stateToSave: ICalculatorState): void => {
    void saveUserState(stateToSave).catch(() => {
      // IGNORO ERRORES DE SINCRONIZACION PARA NO INTERRUMPIR LA EXPERIENCIA
    })
  }, 1000), [])

  // MANTENGO UNA REFERENCIA AL ESTADO ACTUAL PARA APLICAR DEFAULTS SIN RE EJECUTAR EFECTOS
  useEffect(() => {
    stateRef.current = state
  }, [state])

  // HIDRATO EL ESTADO DESDE FIRESTORE CUANDO EXISTE USUARIO AUTENTICADO (EL PANEL SOLO SE MONTA CON SESION)
  const HANDLE_USER_HYDRATION = (): void => {
    if (!authReady || !user || !hasResolved || hasHydrated.current || isHydrating.current) return // ESPERO LA SESION Y LOS AJUSTES
    isHydrating.current = true // EVITO LANZAR DOS CARGAS SI CAMBIAN LOS AJUSTES MIENTRAS HIDRATO

    const LOAD_USER_STATE = async (): Promise<void> => {
      try {
        const storedState: ICalculatorState | null = await loadUserState()
        if (storedState && !IS_PRISTINE(storedState)) {
          dispatch({ type: 'HYDRATE_STATE', payload: storedState }) // RESPETO LA JORNADA EN CURSO
        } else {
          dispatch({ type: 'APPLY_PERCENT_DEFAULTS', payload: percentageDefaultsRef.current }) // JORNADA VACIA: USO LOS AJUSTES
        }
      } catch {
        dispatch({ type: 'APPLY_PERCENT_DEFAULTS', payload: percentageDefaultsRef.current }) // SI FALLA LA CARGA USO LOS AJUSTES
      } finally {
        hasHydrated.current = true // MARCO HIDRATADO PARA PERMITIR EL GUARDADO
      }
    }
    void LOAD_USER_STATE()
  }
  useEffect(HANDLE_USER_HYDRATION, [user, authReady, hasResolved])

  // SI EL USUARIO GUARDA NUEVOS DEFAULTS Y LA JORNADA ESTA VACIA, LOS APLICO EN VIVO
  useEffect(() => {
    if (!hasHydrated.current || !settings) return
    if (previousSettingsRef.current === settings) return // SOLO REACCIONO A UN CAMBIO REAL
    previousSettingsRef.current = settings
    if (!IS_PRISTINE(stateRef.current)) return // NO PISO UNA JORNADA EN CURSO
    dispatch({ type: 'APPLY_PERCENT_DEFAULTS', payload: percentageDefaults })
  }, [settings, percentageDefaults])

  // PERSISTO EL ESTADO SOLO PARA USUARIOS LOGUEADOS Y DESPUES DE LA HIDRATACION INICIAL
  const HANDLE_STATE_PERSISTENCE = (): void => {
    if (user && authReady && hasHydrated.current) {
      debouncedSave(state)
    }
  }
  useEffect(HANDLE_STATE_PERSISTENCE, [state, user, authReady, debouncedSave])

  return (
    <CalculatorContext.Provider value={{ state, dispatch, percentageDefaults }}>
      {children}
    </CalculatorContext.Provider>
  )
}
