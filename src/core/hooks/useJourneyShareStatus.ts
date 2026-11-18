import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchJourneyShareStatus } from '../services/journeyHistory.service'
import type { IUseJourneyShareStatusReturn } from '../interfaces/IUseJourneyShareStatusReturn'
import type { IShareState } from '../interfaces/IShareState'
import { INITIAL_STATE } from '../config/config.initialState'
import type { IVerifyShareResult } from '../interfaces/IVerifyShareResult'
import type { TJourneyShareViewState } from '../types/TJourneyShareViewState'
import { UNAVAILABLE_MESSAGE } from '../services/apiMessages'
import type { IJourneyShareStatusResponse } from '../types/journeyHistory'



// EL BACKEND ES LA FUENTE DE VERDAD: UNA JORNADA SOLO SE EXPORTA SI share-status DICE shareable.
// SI NO HAY id (POR EJEMPLO, UNA VISTA PREVIA SIN GUARDAR) NO SE HACE NINGUNA PETICION.
export const useJourneyShareStatus = (
  journeyId: string | null,
  enabled: boolean = true,
): IUseJourneyShareStatusReturn => {
  const [state, setState] = useState<IShareState>(INITIAL_STATE)
  const [retryToken, setRetryToken] = useState<number>(0)
  const requestIdRef = useRef<number>(0)

  const requestKey: string | null = journeyId ? `${journeyId}::${retryToken}` : null

  useEffect(() => {
    if (!enabled || !journeyId) return

    const key: string = `${journeyId}::${retryToken}`
    const requestId: number = requestIdRef.current + 1
    requestIdRef.current = requestId
    let isActive: boolean = true

    const LOAD_SHARE_STATUS = async (): Promise<void> => {
      try {
        const response: IJourneyShareStatusResponse = await fetchJourneyShareStatus(journeyId)
        if (!isActive || requestIdRef.current !== requestId) return
        setState(
          response.shareable
            ? {
                key,
                viewState: 'ready',
                shareable: true,
                journey: response.journey,
                verificationCode: response.verificationCode,
                error: '',
              }
            : {
                key,
                viewState: 'ready',
                shareable: false,
                journey: null,
                verificationCode: null,
                error: '',
              },
        )
      } catch (cause) {
        if (!isActive || requestIdRef.current !== requestId) return
        setState({
          key,
          viewState: 'error',
          shareable: false,
          journey: null,
          verificationCode: null,
          error: cause instanceof Error ? cause.message : 'No se pudo verificar la jornada.',
        })
      }
    }

    void LOAD_SHARE_STATUS()
    return () => {
      isActive = false
    }
  }, [journeyId, enabled, retryToken])

  const retry = useCallback((): void => {
    setRetryToken((current) => current + 1)
  }, [])

  // SE VUELVE A CONSULTAR JUSTO ANTES DE GENERAR EL ARCHIVO.
  // ASI DETECTAMOS SI LA JORNADA SE ELIMINO O REEMPLAZO DESDE OTRO DISPOSITIVO.
  const verify = useCallback(async (): Promise<IVerifyShareResult> => {
    if (!journeyId || !requestKey) {
      return {
        ok: false,
        journey: null,
        verificationCode: null,
        message: UNAVAILABLE_MESSAGE,
      }
    }

    const requestId: number = requestIdRef.current + 1
    requestIdRef.current = requestId

    try {
      const response = await fetchJourneyShareStatus(journeyId)
      if (requestIdRef.current !== requestId) {
        return {
          ok: false,
          journey: null,
          verificationCode: null,
          message: UNAVAILABLE_MESSAGE,
        }
      }

      if (!response.shareable) {
        setState({
          key: requestKey,
          viewState: 'ready',
          shareable: false,
          journey: null,
          verificationCode: null,
          error: '',
        })
        return {
          ok: false,
          journey: null,
          verificationCode: null,
          message: UNAVAILABLE_MESSAGE,
        }
      }

      setState({
        key: requestKey,
        viewState: 'ready',
        shareable: true,
        journey: response.journey,
        verificationCode: response.verificationCode,
        error: '',
      })
      return {
        ok: true,
        journey: response.journey,
        verificationCode: response.verificationCode,
        message: '',
      }
    } catch (cause) {
      return {
        ok: false,
        journey: null,
        verificationCode: null,
        message: cause instanceof Error ? cause.message : 'No se pudo verificar la jornada.',
      }
    }
  }, [journeyId, requestKey])

  // MIENTRAS NO HAYA UNA RESPUESTA PARA LA CLAVE ACTUAL, LA VISTA SIGUE EN loading.
  const isResolved: boolean =
    enabled && journeyId !== null && state.key === requestKey

  const viewState: TJourneyShareViewState =
    !enabled || journeyId === null
      ? 'idle'
      : isResolved
        ? state.viewState
        : 'loading'

  return {
    viewState,
    shareable: isResolved && state.shareable,
    journey: isResolved ? state.journey : null,
    verificationCode: isResolved ? state.verificationCode : null,
    error: isResolved ? state.error : '',
    retry,
    verify,
  }
}
