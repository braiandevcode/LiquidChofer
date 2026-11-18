import { useCallback, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, RefreshCw, Trash2 } from 'lucide-react'
import { useJourneyTrash } from '../hooks/useJourneyTrash'
import LoadingDots from '../../../shared/styles/LoadingDots'
import StatusBanner from '../../../shared/styles/StatusBanner'
import Button from '../../../shared/ui/Button'
import TrashJourneyList from '../components/trash/TrashJourneyList'
import ConfirmTrashActionModal from '../components/trash/ConfirmTrashActionModal'
import type { IJourneyTrashItem } from '../../../core/types/journeyHistory'

const TrashPage = (): ReactNode => {
  const {
    items,
    total,
    isLoading,
    isLoadingMore,
    error,
    loadFirstPage,
    loadMore,
  } = useJourneyTrash()
  const [journeyToRestore, setJourneyToRestore] = useState<IJourneyTrashItem | null>(null)
  const [notice, setNotice] = useState<string>('')

  const handleRestore = useCallback((journey: IJourneyTrashItem): void => {
    setNotice('')
    setJourneyToRestore(journey)
  }, [])

  const handleClose = useCallback((): void => setJourneyToRestore(null), [])

  // REFRESCO LA PRIMERA PAGINA: UN REEMPLAZO AGREGA LA JORNADA VIGENTE ANTERIOR A LA PAPELERA.
  const handleRestored = useCallback(
    async (replaced: boolean): Promise<void> => {
      setJourneyToRestore(null)
      setNotice(
        replaced
          ? 'Jornada restaurada. La jornada que estaba vigente para esa fecha pasó a la papelera.'
          : 'Jornada restaurada. Ya está de vuelta en tu historial.',
      )
      await loadFirstPage()
    },
    [loadFirstPage],
  )

  // LA JORNADA VENCIO O YA NO ESTA EN PAPELERA (404): CIERRO Y RECARGO.
  const handleStale = useCallback((): void => {
    setJourneyToRestore(null)
    setNotice('Esa jornada ya no está en la papelera.')
    void loadFirstPage()
  }, [loadFirstPage])

  const hasMore: boolean = items.length < total
  const countLabel: string =
    total === 1 ? '1 jornada eliminada' : `${total} jornadas eliminadas`

  return (
    <section className="mx-auto max-w-5xl animate-fade-in-up">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent-red/20 bg-accent-red/10">
            <Trash2 className="h-5 w-5 text-accent-red" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-black tracking-tight text-text-primary md:text-3xl">
              Papelera
            </h1>
            <p className="mt-1 text-sm leading-relaxed text-text-secondary md:text-base">
              Acá quedan las jornadas que eliminaste. Se conservan 30 días y después se eliminan
              definitivamente.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void loadFirstPage()}
          disabled={isLoading}
          aria-label="Actualizar papelera"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-border-subtle bg-bg-card px-3 py-2 text-xs font-semibold text-text-secondary transition-colors cursor-pointer hover:border-border-emphasis hover:bg-bg-hover hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`}
            aria-hidden="true"
          />
          <span className="hidden sm:inline">Actualizar</span>
        </button>
      </div>

      <div className="mb-4">
        <Link
          to="/panel/historial"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary transition-colors hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-violet/30"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Volver al historial
        </Link>
      </div>

      {notice && (
        <div className="mb-4" aria-live="polite">
          <StatusBanner variant="success">{notice}</StatusBanner>
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

      {isLoading && items.length === 0 ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-text-secondary">
          <LoadingDots />
          <span>Cargando papelera...</span>
        </div>
      ) : error && items.length === 0 ? null : items.length === 0 ? (
        <div className="card-glass card-accent-top rounded-2xl px-6 py-10 md:p-12">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-accent-red/20 bg-accent-red/10">
              <Trash2 className="h-7 w-7 text-accent-red" aria-hidden="true" />
            </div>
            <h2 className="font-display text-xl font-black tracking-tight text-text-primary md:text-2xl">
              No hay jornadas eliminadas
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-text-secondary md:text-base">
              Cuando elimines una jornada del historial, va a aparecer acá.
            </p>
            <Link
              to="/panel/historial"
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl border border-border-subtle bg-bg-card px-5 py-2.5 font-display text-sm font-semibold text-text-primary transition-colors hover:border-border-emphasis hover:bg-bg-hover focus:outline-none focus:ring-2 focus:ring-accent-violet/30"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Ir al historial
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-xs font-medium text-text-muted" aria-live="polite">
            {countLabel}
          </p>

          <TrashJourneyList journeys={items} onRestore={handleRestore} />

          {hasMore && (
            <Button
              variant="secondary"
              onClick={() => void loadMore()}
              disabled={isLoadingMore}
              className="flex items-center justify-center gap-2"
            >
              {isLoadingMore ? <LoadingDots /> : 'Ver más jornadas'}
            </Button>
          )}
        </div>
      )}

      <ConfirmTrashActionModal
        key={journeyToRestore ? journeyToRestore.id : 'confirm-trash-closed'}
        journey={journeyToRestore}
        onClose={handleClose}
        onRestored={handleRestored}
        onStale={handleStale}
      />
    </section>
  )
}

export default TrashPage
