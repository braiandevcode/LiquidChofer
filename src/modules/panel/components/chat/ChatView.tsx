import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Eye, PanelLeft, Sparkles } from 'lucide-react'
import { useChat } from '../../context/chatContextValue'
import type { ICalculationState } from '../../../../core/interfaces/ICalculationState'
import type { IJourneyDetail } from '../../../../core/types/journeyHistory'
import ReceiptModal from '../../../calculator/modals/ReceiptModal'
import SaveJourneyModal from '../../../calculator/modals/SaveJourneyModal'
import StatusBanner from '../../../../shared/styles/StatusBanner'
import ChatComposer, { type IChatComposerHandle } from './ChatComposer'
import ChatMessageList from './ChatMessageList'
import ConversationHistoryView from './ConversationHistoryView'
import ConversationSidebar from './ConversationSidebar'

const ChatView = (): ReactNode => {
  const {
    activeConversation,
    messages,
    isSending,
    usage,
    error,
    isNewChat,
    isHistoryOpen,
    noUsage,
    composerDisabled,
    newChatFocusToken,
    startNewChat,
    confirmCalculation,
    sendMessage,
    isCalculationSaved,
    markCalculationSaved,
  } = useChat()
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false)
  const [pendingSaveCalculation, setPendingSaveCalculation] = useState<ICalculationState | null>(null)
  const [savedJourney, setSavedJourney] = useState<IJourneyDetail | null>(null)
  const [savedReceiptOpen, setSavedReceiptOpen] = useState<boolean>(false)
  const composerRef = useRef<IChatComposerHandle | null>(null)
  const lastFocusTokenRef = useRef<number>(newChatFocusToken)

  // AL EMPEZAR UN CHAT NUEVO LLEVO EL FOCO A LA ENTRADA (IGNORO EL MONTAJE INICIAL)
  useEffect(() => {
    if (newChatFocusToken === lastFocusTokenRef.current) return
    lastFocusTokenRef.current = newChatFocusToken
    composerRef.current?.focus()
  }, [newChatFocusToken])

  // GUARDAR DESDE EL CHAT ABRE EL MISMO MODAL DE CONFLICTO QUE LA CALCULADORA.
  const HANDLE_SAVE_CALCULATION = useCallback((calculation: ICalculationState): void => {
    setPendingSaveCalculation(calculation)
  }, [])

  const HANDLE_CLOSE_SAVE_MODAL = useCallback((): void => {
    setPendingSaveCalculation(null)
  }, [])

  // SOLO MARCO LA JORNADA COMO GUARDADA CUANDO EL BACKEND CONFIRMA LA CREACION.
  const HANDLE_JOURNEY_SAVED = useCallback(
    (journey: IJourneyDetail): void => {
      setSavedJourney(journey)
      if (pendingSaveCalculation) {
        markCalculationSaved(pendingSaveCalculation.id, journey.id)
      }
      setPendingSaveCalculation(null)
    },
    [pendingSaveCalculation, markCalculationSaved],
  )

  const HANDLE_OPEN_SAVED_RECEIPT = useCallback((): void => setSavedReceiptOpen(true), [])
  const HANDLE_CLOSE_SAVED_RECEIPT = useCallback((): void => setSavedReceiptOpen(false), [])

  return (
    <section className="flex h-[calc(100dvh-15rem)] min-h-0 gap-3 md:h-[calc(100dvh-8rem)] md:min-h-[420px] md:gap-4">
      {isHistoryOpen ? (
        <ConversationHistoryView />
      ) : (
        <>
          <ConversationSidebar
            variant="drawer"
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border-subtle bg-bg-card">
            <header className="flex items-center justify-between border-b border-border-subtle px-3 py-2 md:px-5 md:py-2.5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(true)}
                  aria-label="Ver conversaciones"
                  className="flex h-10 w-10 touch-manipulation items-center justify-center rounded-lg text-text-secondary transition-colors cursor-pointer hover:bg-bg-hover hover:text-text-primary active:scale-95 md:hidden"
                >
                  <PanelLeft className="h-4 w-4" aria-hidden="true" />
                </button>
                <Sparkles className="h-5 w-5 text-accent-violet" aria-hidden="true" />
                <div>
                  <h2 className="font-display text-sm font-bold text-text-primary">ChófIA</h2>
                  {usage && (
                    <p className="text-[11px] font-medium text-text-muted">
                      {usage.remaining} de {usage.limit} mensajes hoy
                    </p>
                  )}
                </div>
              </div>
            </header>

            {savedJourney && (
              <div className="px-3 pt-3 md:px-5">
                <StatusBanner
                  variant="success"
                  icon={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
                >
                  <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    Jornada guardada.
                    <button
                      type="button"
                      onClick={HANDLE_OPEN_SAVED_RECEIPT}
                      className="inline-flex cursor-pointer items-center gap-1 font-semibold text-accent-teal underline decoration-accent-teal/40 underline-offset-2 transition-colors hover:text-accent-teal-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal/50"
                    >
                      <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                      Ver recibo
                    </button>
                    <Link
                      to="/panel/historial"
                      className="inline-flex items-center gap-1 font-semibold text-accent-violet underline decoration-accent-violet/40 underline-offset-2 transition-colors hover:text-accent-violet/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-violet/50"
                    >
                      Ir a historial
                    </Link>
                  </span>
                </StatusBanner>
              </div>
            )}

            {error && (
              <div className="px-3 pt-3 md:px-5">
                <StatusBanner variant="error">{error}</StatusBanner>
              </div>
            )}

            {noUsage && (
              <div className="px-3 pt-3 md:px-5">
                <StatusBanner variant="warning">
                  Alcanzaste tu límite diario de mensajes gratuitos. Volvé mañana.
                </StatusBanner>
              </div>
            )}

            {!activeConversation && !isNewChat && messages.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-accent-violet/20 bg-accent-violet/10">
                  <Sparkles className="h-7 w-7 text-accent-violet" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-text-primary">
                    Tu copiloto inteligente
                  </h3>
                  <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-text-secondary">
                    Preguntale lo que necesites sobre tu jornada o subí la foto de un comprobante
                    para que ChófIA complete los datos.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={startNewChat}
                  className="min-h-11 touch-manipulation rounded-xl bg-accent-violet px-5 py-2.5 text-sm font-bold text-white shadow-glow-violet transition-colors cursor-pointer hover:brightness-110 active:scale-[0.98] md:min-h-0 md:px-4 md:py-2 md:text-xs"
                >
                  Empezar a chatear
                </button>
              </div>
            ) : !activeConversation && messages.length === 0 && !isSending ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
                <Sparkles className="h-6 w-6 text-accent-violet" aria-hidden="true" />
                <p className="text-sm font-medium text-text-primary">Nuevo chat</p>
                <p className="text-sm text-text-secondary">Escribí tu primer mensaje para empezar.</p>
              </div>
            ) : (
              <ChatMessageList
                messages={messages}
                isSending={isSending}
                confirmDisabled={composerDisabled}
                onConfirmCalculation={confirmCalculation}
                onSaveCalculation={HANDLE_SAVE_CALCULATION}
                isCalculationSaved={isCalculationSaved}
              />
            )}

            <ChatComposer
              ref={composerRef}
              onSend={sendMessage}
              disabled={composerDisabled}
              isSending={isSending}
            />
          </div>

          <SaveJourneyModal
            isOpen={pendingSaveCalculation !== null}
            onClose={HANDLE_CLOSE_SAVE_MODAL}
            onSaved={HANDLE_JOURNEY_SAVED}
            calculation={pendingSaveCalculation}
          />

          <ReceiptModal
            isOpen={savedReceiptOpen}
            journeyId={savedJourney?.id ?? null}
            onClose={HANDLE_CLOSE_SAVED_RECEIPT}
            readOnly
          />
        </>
      )}
    </section>
  )
}

export default ChatView
