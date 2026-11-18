import type { ReactNode } from 'react'
import { ArrowLeft, Plus } from 'lucide-react'
import { useChat } from '../../context/chatContextValue'
import StatusBanner from '../../../../shared/styles/StatusBanner'
import ConversationList from './ConversationList'

const ConversationHistoryView = (): ReactNode => {
  const {
    conversations,
    activeConversation,
    error,
    selectConversation,
    startNewChat,
    deleteConversation,
    closeHistory,
  } = useChat()

  const countLabel: string =
    conversations.length === 1 ? '1 conversación' : `${conversations.length} conversaciones`

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border-subtle bg-bg-card">
      <header className="flex items-center justify-between gap-3 border-b border-border-subtle px-3 py-2 md:px-5 md:py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={closeHistory}
            aria-label="Volver al chat"
            title="Volver al chat"
            className="flex h-10 w-10 shrink-0 touch-manipulation items-center justify-center rounded-lg text-text-secondary transition-colors cursor-pointer hover:bg-bg-hover hover:text-text-primary active:scale-95 md:h-9 md:w-9"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <div className="min-w-0">
            <h2 className="truncate font-display text-sm font-bold text-text-primary">
              Historial de conversaciones
            </h2>
            <p className="text-[11px] font-medium text-text-muted">{countLabel}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={startNewChat}
          className="flex min-h-9 shrink-0 touch-manipulation items-center justify-center rounded-xl border border-border-subtle bg-bg-card px-2.5 py-1.5 text-xs font-semibold text-text-secondary transition-colors cursor-pointer hover:border-accent-violet/40 hover:text-accent-violet active:scale-95"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="ml-1">Nueva</span>
        </button>
      </header>

      {error && (
        <div className="px-3 pt-3 md:px-5">
          <StatusBanner variant="error">{error}</StatusBanner>
        </div>
      )}

      <div className="chat-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:p-3">
        <ConversationList
          conversations={conversations}
          activeId={activeConversation?.id ?? null}
          onSelect={(conversation) => void selectConversation(conversation)}
          onNew={startNewChat}
          onDelete={deleteConversation}
          variant="comfortable"
        />
      </div>
    </div>
  )
}

export default ConversationHistoryView
