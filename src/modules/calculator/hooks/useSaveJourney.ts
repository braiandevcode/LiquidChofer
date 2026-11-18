import { useCallback, useState } from 'react'
import { createJourney } from '../../../core/services/journeyHistory.service'
import { ApiError } from '../../../core/services/api'
import { TO_USER_ERROR } from '../../../core/services/apiMessages'
import type {
  ICreateJourneyPayload,
  IJourneyDateExistsPayload,
  IJourneyDetail,
  IJourneySaveConflict,
} from '../../../core/types/journeyHistory'

interface IUseSaveJourneyReturn {
  saveJourney: (payload: ICreateJourneyPayload) => Promise<IJourneyDetail | null>
  isSaving: boolean
  error: string
  conflict: IJourneySaveConflict | null
  clearConflict: () => void
}

// GUARDO LA JORNADA EN EL BACKEND, QUE ES LA FUENTE DE VERDAD DEL CALCULO.
// SI LA FECHA YA EXISTE (409), DEVUELVO EL CONFLICTO PARA QUE LA UI OFREZCA REEMPLAZAR.
export const useSaveJourney = (): IUseSaveJourneyReturn => {
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [conflict, setConflict] = useState<IJourneySaveConflict | null>(null)

  const saveJourney = useCallback(
    async (payload: ICreateJourneyPayload): Promise<IJourneyDetail | null> => {
      setIsSaving(true)
      setError('')
      try {
        return await createJourney(payload)
      } catch (cause) {
        if (
          cause instanceof ApiError &&
          cause.status === 409 &&
          cause.code === 'JOURNEY_DATE_EXISTS'
        ) {
          const body = cause.payload as IJourneyDateExistsPayload | null | undefined
          setConflict({
            journeyDate: payload.journeyDate,
            existing: body?.existing ?? null,
          })
          return null
        }
        setError(TO_USER_ERROR(cause, 'No se pudo guardar la jornada.'))
        return null
      } finally {
        setIsSaving(false)
      }
    },
    [],
  )

  // LIMPIO EL CONFLICTO CUANDO EL USUARIO CAMBIA DE FECHA O CIERRA EL AVISO.
  const clearConflict = useCallback((): void => {
    setConflict(null)
  }, [])

  return { saveJourney, isSaving, error, conflict, clearConflict }
}
