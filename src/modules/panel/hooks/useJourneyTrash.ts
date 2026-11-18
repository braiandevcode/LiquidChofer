import { useCallback, useEffect, useState } from 'react'
import { fetchTrash } from '../../../core/services/journeyHistory.service'
import type { IJourneyTrashItem } from '../../../core/types/journeyHistory'

const PAGE_SIZE: number = 20

interface IUseJourneyTrashReturn {
  items: IJourneyTrashItem[]
  total: number
  isLoading: boolean
  isLoadingMore: boolean
  error: string
  loadFirstPage: () => Promise<void>
  loadMore: () => Promise<void>
}

// CENTRALIZO LA CARGA PAGINADA DE LA PAPELERA.
export const useJourneyTrash = (): IUseJourneyTrashReturn => {
  const [items, setItems] = useState<IJourneyTrashItem[]>([])
  const [total, setTotal] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  const loadFirstPage = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    setError('')
    try {
      const data = await fetchTrash(PAGE_SIZE, 0)
      setItems(data.items)
      setTotal(data.total)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo cargar la papelera.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // CARGO LA PRIMERA PAGINA AL MONTAR Y EVITO ACTUALIZAR EL ESTADO SI LA PANTALLA SE DESMONTA.
  const LOAD_INITIAL = useCallback((): (() => void) => {
    let isActive: boolean = true

    const LOAD = async (): Promise<void> => {
      try {
        const data = await fetchTrash(PAGE_SIZE, 0)
        if (!isActive) return
        setItems(data.items)
        setTotal(data.total)
      } catch (cause) {
        if (!isActive) return
        setError(cause instanceof Error ? cause.message : 'No se pudo cargar la papelera.')
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    void LOAD()
    return () => {
      isActive = false
    }
  }, [])

  useEffect(LOAD_INITIAL, [LOAD_INITIAL])

  const loadMore = useCallback(async (): Promise<void> => {
    if (isLoadingMore) return
    setIsLoadingMore(true)
    setError('')
    try {
      const data = await fetchTrash(PAGE_SIZE, items.length)
      setItems((current) => [...current, ...data.items])
      setTotal(data.total)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudieron cargar más jornadas.')
    } finally {
      setIsLoadingMore(false)
    }
  }, [isLoadingMore, items.length])

  return {
    items,
    total,
    isLoading,
    isLoadingMore,
    error,
    loadFirstPage,
    loadMore,
  }
}
