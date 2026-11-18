import { useState, type ReactNode } from 'react'
import { Check, Loader2, MessageSquare, RotateCw, Trash2, X } from 'lucide-react'
import type { IConversation } from '../../../../core/interfaces/IConversation'
import { cn } from '../../../../shared/lib/utils'
import { FORMAT_RELATIVE_TIME } from './chat.utils'

interface IConversationListProps {
  conversations: IConversation[]
  activeId: string | null
  onSelect: (conversation: IConversation) => void
  onNew: () => void
  onDelete: (conversationId: string) => Promise<boolean>
  variant?: 'compact' | 'comfortable'
}

const ConversationList = ({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  variant = 'comfortable',
}: IConversationListProps): ReactNode => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [failedDeleteId, setFailedDeleteId] = useState<string | null>(null)

  const isCompact: boolean = variant === 'compact'
  const actionSize: string = isCompact ? 'h-7 w-7' : 'h-8 w-8'

  const HANDLE_CANCEL_DELETE = (): void => {
    setConfirmDeleteId(null)
    setFailedDeleteId(null)
  }

  const HANDLE_DELETE = async (conversationId: string): Promise<void> => {
    if (deletingId) return
    setDeletingId(conversationId)
    try {
      const wasDeleted: boolean = await onDelete(conversationId)
      if (wasDeleted) {
        setConfirmDeleteId(null)
        setFailedDeleteId(null)
      } else {
        setFailedDeleteId(conversationId)
      }
    } catch {
      setFailedDeleteId(conversationId)
    } finally {
      setDeletingId(null)
    }
  }

  const HANDLE_SELECT = (conversation: IConversation): void => {
    HANDLE_CANCEL_DELETE()
    onSelect(conversation)
  }

  const HANDLE_REQUEST_DELETE = (conversationId: string): void => {
    setFailedDeleteId(null)
    setConfirmDeleteId(conversationId)
  }

  if (conversations.length === 0) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-2 px-4 text-center',
          isCompact ? 'py-6' : 'h-full py-8',
        )}
      >
        <MessageSquare className="h-6 w-6 text-text-muted/70" aria-hidden="true" />
        <p className="text-sm leading-relaxed text-text-muted">Todavía no tenés conversaciones.</p>
        <button
          type="button"
          onClick={onNew}
          className="mt-1 min-h-9 touch-manipulation rounded-xl bg-accent-violet/15 px-3 py-1.5 text-xs font-semibold text-accent-violet transition-colors cursor-pointer hover:bg-accent-violet/25 active:scale-95"
        >
          Iniciar un chat
        </button>
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-1">
      {conversations.map((conversation) => {
        const isActive: boolean = conversation.id === activeId
        const isConfirming: boolean = confirmDeleteId === conversation.id
        const isDeleting: boolean = deletingId === conversation.id
        const hasDeleteFailed: boolean = failedDeleteId === conversation.id
        return (
          <li key={conversation.id}>
            <div
              className={cn(
                'group flex items-center rounded-xl border transition-colors',
                isCompact ? 'gap-1.5 px-2.5 py-2' : 'gap-2 px-3 py-2.5',
                isActive
                  ? 'border-accent-violet/25 bg-accent-violet/15'
                  : 'border-transparent hover:bg-bg-hover',
              )}
            >
              <button
                type="button"
                onClick={() => HANDLE_SELECT(conversation)}
                className="min-w-0 flex-1 touch-manipulation text-left cursor-pointer"
              >
                <p
                  className={cn(
                    'truncate font-display font-semibold',
                    isCompact ? 'text-xs' : 'text-sm',
                    isActive ? 'text-accent-violet' : 'text-text-primary',
                  )}
                >
                  {conversation.title ?? 'Nuevo chat'}
                </p>
                <p className="mt-0.5 text-[11px] font-medium text-text-muted">
                  {FORMAT_RELATIVE_TIME(conversation.createdAt)}
                </p>
              </button>

              {isConfirming ? (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => void HANDLE_DELETE(conversation.id)}
                    disabled={isDeleting}
                    aria-label={hasDeleteFailed ? 'Reintentar eliminación' : 'Confirmar eliminación'}
                    title={hasDeleteFailed ? 'Reintentar eliminación' : 'Confirmar eliminación'}
                    className={cn(
                      'flex touch-manipulation items-center justify-center rounded-md bg-accent-red/15 text-accent-red transition-colors cursor-pointer hover:bg-accent-red/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
                      actionSize,
                    )}
                  >
                    {isDeleting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    ) : hasDeleteFailed ? (
                      <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={HANDLE_CANCEL_DELETE}
                    disabled={isDeleting}
                    aria-label="Cancelar eliminación"
                    className={cn(
                      'flex touch-manipulation items-center justify-center rounded-md text-text-secondary transition-colors cursor-pointer hover:bg-bg-hover hover:text-text-primary active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
                      actionSize,
                    )}
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => HANDLE_REQUEST_DELETE(conversation.id)}
                  aria-label="Eliminar conversación"
                  title="Eliminar conversación"
                  className={cn(
                    'flex touch-manipulation items-center justify-center rounded-md text-text-muted opacity-100 transition-colors cursor-pointer hover:bg-accent-red/10 hover:text-accent-red active:scale-95 md:opacity-0 md:group-hover:opacity-100',
                    actionSize,
                  )}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}
            </div>

            {hasDeleteFailed && (
              <p role="alert" className="px-3 pb-2 pt-1 text-[11px] font-medium text-accent-red">
                No se pudo eliminar. Presioná el botón para reintentar.
              </p>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export default ConversationList
