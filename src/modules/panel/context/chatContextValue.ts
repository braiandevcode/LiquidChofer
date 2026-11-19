import { createContext, useContext } from 'react'
import type { IChatMessageState } from '../../../core/interfaces/IChatMessageState'
import type { IChatUsage } from '../../../core/interfaces/IChatUsage'
import type { IConversation } from '../../../core/interfaces/IConversation'

export interface IChatContextValue {
  conversations: IConversation[]
  activeConversation: IConversation | null
  messages: IChatMessageState[]
  isSending: boolean
  usage: IChatUsage | null
  error: string
  isNewChat: boolean
  isHistoryOpen: boolean
  isChatRoute: boolean
  noUsage: boolean
  composerDisabled: boolean
  newChatFocusToken: number
  selectConversation: (conversation: IConversation) => Promise<void>
  startNewChat: () => void
  deleteConversation: (conversationId: string) => Promise<boolean>
  sendMessage: (text: string, imagesData: string[]) => Promise<boolean>
  confirmCalculation: (conversationId: string) => Promise<boolean>
  isCalculationSaved: (calculationId: string) => boolean
  markCalculationSaved: (calculationId: string, journeyId: string) => void
  openHistory: () => void
  closeHistory: () => void
  refreshList: () => Promise<void>
}

export const ChatContext = createContext<IChatContextValue | null>(null)

export const useChat = (): IChatContextValue => {
  const context: IChatContextValue | null = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat debe usarse dentro de ChatProvider')
  }
  return context
}
