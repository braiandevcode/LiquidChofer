import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Calculator, History, RefreshCw, RotateCcw, Trash2, X } from 'lucide-react'
import { fetchJourneys, restoreJourney } from '../../../core/services/journeyHistory.service'
import { ApiError } from '../../../core/services/api'
import LoadingDots from '../../../shared/styles/LoadingDots'
import StatusBanner from '../../../shared/styles/StatusBanner'
import Button from '../../../shared/ui/Button'
import JourneyList from '../components/history/JourneyList'
import JourneyDetailModal from '../components/history/JourneyDetailModal'
import ConfirmDeleteJourneyModal from '../components/history/ConfirmDeleteJourneyModal'
import { FORMAT_JOURNEY_DATE } from '../../../shared/lib/journey'
import type {
  IJourneyDetail,
  IJourneyHistory,
} from '../../../core/types/journeyHistory'

const PAGE_SIZE: number = 20

const HistoryPage = (): ReactNode => {
  const [journeys, setJourneys] = useState<IJourneyHistory[]>([])
  const [total, setTotal] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [detailId, setDetailId] = useState<string | null>(null)
  const [journeyToDelete, setJourneyToDelete] = useState<IJourneyHistory | null>(null)
  const [deletedJourney, setDeletedJourney] = useState<IJourneyHistory | null>(null)
  const [isUndoing, setIsUndoing] = useState<boolean>(false)
  const [undoError, setUndoError] = useState<string>('')

  const loadFirstPage = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    setError('')
    try {
      const data = await fetchJourneys(PAGE_SIZE, 0)
      setJourneys(data.items)
      setTotal(data.total)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo cargar el historial.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let isActive: boolean = true

    const LOAD_INITIAL = async (): Promise<void> => {
      try {
        const data = await fetchJourneys(PAGE_SIZE, 0)
        if (!isActive) return
        setJourneys(data.items)
        setTotal(data.total)
      } catch (cause) {
        if (!isActive) return
        setError(cause instanceof Error ? cause.message : 'No se pudo cargar el historial.')
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    void LOAD_INITIAL()
    return () => {
      isActive = false
    }
  }, [])

  const handleLoadMore = useCallback(async (): Promise<void> => {
    if (isLoadingMore) return
    setIsLoadingMore(true)
    setError('')
    try {
      const data = await fetchJourneys(PAGE_SIZE, journeys.length)
      setJourneys((current) => [...current, ...data.items])
      setTotal(data.total)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudieron cargar más jornadas.')
    } finally {
      setIsLoadingMore(false)
    }
  }, [isLoadingMore, journeys.length])

  const handleOpen = useCallback((journeyId: string): void => setDetailId(journeyId), [])
  const handleCloseDetail = useCallback((): void => setDetailId(null), [])

  // SI share-status INDICA QUE LA JORNADA YA NO ESTA VIGENTE, SACO LA FILA OBSOLETA DEL LISTADO.
  const handleJourneyUnavailable = useCallback((journeyId: string): void => {
    if (!journeys.some((item) => item.id === journeyId)) return
    setJourneys((current) => current.filter((item) => item.id !== journeyId))
    setTotal((current) => Math.max(0, current - 1))
  }, [journeys])

  // CIERRO EL DETALLE Y PIDO CONFIRMACION PARA ELIMINAR
  const handleRequestDelete = useCallback((journey: IJourneyDetail): void => {
    setDetailId(null)
    setJourneyToDelete(journey)
  }, [])

  const handleCloseDelete = useCallback((): void => setJourneyToDelete(null), [])

  const handleDeleted = useCallback((journey: IJourneyHistory): void => {
    setJourneyToDelete(null)
    setJourneys((current) => current.filter((item) => item.id !== journey.id))
    setTotal((current) => Math.max(0, current - 1))
    setUndoError('')
    setDeletedJourney(journey)
  }, [])

  // DESHAGO EL ULTIMO BORRADO: LO RESTAURO EN EL BACKEND Y REFRESCO EL HISTORIAL.
  const handleUndo = useCallback(async (): Promise<void> => {
    if (!deletedJourney || isUndoing) return
    setIsUndoing(true)
    setUndoError('')
    try {
      await restoreJourney(deletedJourney.id)
      setDeletedJourney(null)
      await loadFirstPage()
    } catch (cause) {
      // SI YA HAY UNA VIGENTE EN ESA FECHA, EL REEMPLAZO SE CONFIRMA EN LA PAPELERA.
      if (
        cause instanceof ApiError &&
        cause.status === 409 &&
        cause.code === 'JOURNEY_DATE_EXISTS'
      ) {
        setUndoError(
          'Ya hay una jornada vigente con esa fecha. Podés resolverlo desde la papelera, donde se te pedirá confirmación para reemplazarla.',
        )
      } else if (cause instanceof ApiError && cause.status === 404) {
        setUndoError('La jornada ya no está en la papelera.')
        void loadFirstPage()
      } else {
        setUndoError(cause instanceof Error ? cause.message : 'No se pudo restaurar la jornada.')
      }
    } finally {
      setIsUndoing(false)
    }
  }, [deletedJourney, isUndoing, loadFirstPage])

  const handleDismissNotice = useCallback((): void => {
    setDeletedJourney(null)
    setUndoError('')
  }, [])

  const hasMore: boolean = journeys.length < total
  const countLabel: string =
    total === 1 ? '1 jornada guardada' : `${total} jornadas guardadas`

  return (
    <section className="mx-auto max-w-5xl animate-fade-in-up">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent-violet/20 bg-accent-violet/10">
            <History className="h-5 w-5 text-accent-violet" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-black tracking-tight text-text-primary md:text-3xl">
              Historial
            </h1>
            <p className="mt-1 text-sm leading-relaxed text-text-secondary md:text-base">
              Revisá tus jornadas guardadas y su resumen completo.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            to="/panel/papelera"
            aria-label="Ir a la papelera"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border-subtle bg-bg-card px-3 py-2 text-xs font-semibold text-text-secondary transition-colors hover:border-border-emphasis hover:bg-bg-hover hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-violet/30"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Papelera</span>
          </Link>

          <button
            type="button"
            onClick={() => void loadFirstPage()}
            disabled={isLoading}
            aria-label="Actualizar historial"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border-subtle bg-bg-card px-3 py-2 text-xs font-semibold text-text-secondary transition-colors cursor-pointer hover:border-border-emphasis hover:bg-bg-hover hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>
      </div>

      {deletedJourney && (
        <div className="mb-4" aria-live="polite">
          <StatusBanner variant={undoError ? 'error' : 'success'}>
            <div className="flex w-full flex-col gap-2">
              <span>
                {undoError ||
                  `Jornada del ${FORMAT_JOURNEY_DATE(deletedJourney.journeyDate)} enviada a la papelera.`}
              </span>
              <span className="flex flex-wrap items-center gap-3">
                {!undoError && (
                  <button
                    type="button"
                    onClick={() => void handleUndo()}
                    disabled={isUndoing}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-accent-teal/30 px-2.5 py-1 font-display text-xs font-bold text-accent-teal transition-colors hover:bg-accent-teal/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    {isUndoing ? 'Restaurando...' : 'Deshacer'}
                  </button>
                )}
                <Link
                  to="/panel/papelera"
                  className="font-display text-xs font-bold text-text-secondary underline-offset-2 transition-colors hover:text-text-primary hover:underline"
                >
                  Ver papelera
                </Link>
                <button
                  type="button"
                  onClick={handleDismissNotice}
                  aria-label="Cerrar aviso"
                  className="ml-auto inline-flex cursor-pointer items-center rounded-lg p-1 text-text-muted transition-colors hover:text-text-primary"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </span>
            </div>
          </StatusBanner>
        </div>
      )}

      {error && (
        <div className="mb-4">
          <StatusBanner variant="error">
            <span className="flex flex-col gap-2">
              <span>{error}</span>
              <button
                type="button"
                onClick={() => void loadFirstPage()}
                disabled={isLoading}
                className="inline-flex w-fit cursor-pointer items-center rounded-lg border border-accent-red/30 px-2.5 py-1 font-display text-xs font-bold text-accent-red transition-colors hover:bg-accent-red/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? 'Reintentando...' : 'Reintentar'}
              </button>
            </span>
          </StatusBanner>
        </div>
      )}

      {isLoading && journeys.length === 0 ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-text-secondary">
          <LoadingDots />
          <span>Cargando historial...</span>
        </div>
      ) : error && journeys.length === 0 ? null : journeys.length === 0 ? (
        <div className="card-glass card-accent-top rounded-2xl px-6 py-10 md:p-12">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-accent-violet/20 bg-accent-violet/10">
              <History className="h-7 w-7 text-accent-violet" aria-hidden="true" />
            </div>
            <h2 className="font-display text-xl font-black tracking-tight text-text-primary md:text-2xl">
              Todavía no hay jornadas guardadas
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-text-secondary md:text-base">
              Calculá tu jornada y guardala para verla acá con el desglose completo.
            </p>
            <Link
              to="/panel/calculadora"
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl border border-border-subtle bg-bg-card px-5 py-2.5 font-display text-sm font-semibold text-text-primary transition-colors hover:border-border-emphasis hover:bg-bg-hover focus:outline-none focus:ring-2 focus:ring-accent-violet/30"
            >
              <Calculator className="h-4 w-4" aria-hidden="true" />
              Ir a la calculadora
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-xs font-medium text-text-muted">{countLabel}</p>

          <JourneyList journeys={journeys} onOpen={handleOpen} />

          {hasMore && (
            <Button
              variant="secondary"
              onClick={() => void handleLoadMore()}
              disabled={isLoadingMore}
              className="flex items-center justify-center gap-2"
            >
              {isLoadingMore ? <LoadingDots /> : 'Ver más jornadas'}
            </Button>
          )}
        </div>
      )}

      <JourneyDetailModal
        key={detailId ?? 'journey-detail-closed'}
        journeyId={detailId}
        onClose={handleCloseDetail}
        onRequestDelete={handleRequestDelete}
        onJourneyUnavailable={handleJourneyUnavailable}
      />

      <ConfirmDeleteJourneyModal
        key={journeyToDelete?.id ?? 'confirm-delete-closed'}
        journey={journeyToDelete}
        onClose={handleCloseDelete}
        onDeleted={handleDeleted}
      />
    </section>
  )
}

export default HistoryPage
