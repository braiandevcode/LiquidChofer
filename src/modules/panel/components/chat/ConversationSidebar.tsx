import { useState, type ReactNode } from 'react'
import { ArrowRight, MessageSquare, Plus, X } from 'lucide-react'
import type { IConversation } from '../../../../core/interfaces/IConversation'
import { cn } from '../../../../shared/lib/utils'
import { useChat } from '../../context/chatContextValue'
import ConversationList from './ConversationList'

interface IConversationSidebarProps {
  variant: 'panel' | 'drawer'
  isOpen?: boolean
  onClose?: () => void
}

const PANEL_LIMIT: number = 5

const ConversationSidebar = ({
  variant,
  isOpen = false,
  onClose,
}: IConversationSidebarProps): ReactNode => {
  const {
    conversations,
    activeConversation,
    selectConversation,
    startNewChat,
    deleteConversation,
    openHistory,
  } = useChat()
  const [listResetKey, setListResetKey] = useState<number>(0)

  const HANDLE_NEW = (): void => {
    setListResetKey((key) => key + 1)
    startNewChat()
    if (variant === 'drawer') onClose?.()
  }

  const HANDLE_SELECT = (conversation: IConversation): void => {
    void selectConversation(conversation)
    if (variant === 'drawer') onClose?.()
  }

  const HANDLE_VIEW_ALL = (): void => {
    openHistory()
    if (variant === 'drawer') onClose?.()
  }

  const VISIBLE_CONVERSATIONS: IConversation[] = conversations.slice(0, PANEL_LIMIT)
  const HAS_MORE: boolean = conversations.length >= PANEL_LIMIT

  const PANEL_CONTENT = (showClose: boolean): ReactNode => (
    <>
      <div className="flex items-center justify-between gap-2 border-b border-border-subtle px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <MessageSquare className="h-4 w-4 shrink-0 text-accent-violet" aria-hidden="true" />
          <span className="truncate font-display text-sm font-bold text-text-primary">Conversaciones</span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={HANDLE_NEW}
            aria-label="Nueva conversación"
            className="flex min-h-9 touch-manipulation items-center justify-center rounded-xl border border-border-subtle bg-bg-card px-2.5 py-1.5 text-xs font-semibold text-text-secondary transition-colors cursor-pointer hover:border-accent-violet/40 hover:text-accent-violet active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="ml-1">Nueva</span>
          </button>
          {showClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar conversaciones"
              className="flex h-9 w-9 touch-manipulation items-center justify-center rounded-lg text-text-secondary transition-colors cursor-pointer hover:bg-bg-hover hover:text-text-primary active:scale-95"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <div
        className={cn(
          variant === 'drawer'
            ? 'chat-scrollbar flex-1 overflow-y-auto p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]'
            : 'p-1.5',
        )}
      >
        <ConversationList
          key={listResetKey}
          conversations={VISIBLE_CONVERSATIONS}
          activeId={activeConversation?.id ?? null}
          onSelect={HANDLE_SELECT}
          onNew={HANDLE_NEW}
          onDelete={deleteConversation}
          variant={variant === 'panel' ? 'compact' : 'comfortable'}
        />
      </div>

      {HAS_MORE && (
        <button
          type="button"
          onClick={HANDLE_VIEW_ALL}
          className="flex w-full touch-manipulation items-center justify-center gap-1.5 border-t border-border-subtle px-3 py-2 text-xs font-semibold text-accent-violet transition-colors cursor-pointer hover:bg-accent-violet/10 active:scale-[0.99]"
        >
          Ver Todo
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}
    </>
  )

  if (variant === 'panel') {
    return (
      <section
        className="mt-1 flex shrink-0 flex-col overflow-hidden rounded-xl border border-border-subtle bg-bg-card"
        aria-label="Conversaciones recientes"
      >
        {PANEL_CONTENT(false)}
      </section>
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Conversaciones">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <aside className="absolute inset-y-0 left-0 flex w-80 max-w-[85vw] flex-col overflow-hidden bg-bg-card shadow-2xl animate-slide-in-left">
        {PANEL_CONTENT(true)}
      </aside>
    </div>
  )
}

export default ConversationSidebar
