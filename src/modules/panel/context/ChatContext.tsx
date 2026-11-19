import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { TO_USER_ERROR } from '../../../core/services/apiMessages'
import {
  deleteConversation as DELETE_CONVERSATION_REQUEST,
  fetchConversationMessages,
  fetchConversations,
  fetchUsage,
  sendChatMessage,
} from '../../../core/services/chat.service'
import type { IChatMessageState } from '../../../core/interfaces/IChatMessageState'
import type { IChatResponse } from '../../../core/interfaces/IChatResponse'
import type { IConversation } from '../../../core/interfaces/IConversation'
import type { IConversationMessage } from '../../../core/interfaces/IConversationMessage'
import type { IChatUsage } from '../../../core/interfaces/IChatUsage'
import { ChatContext, type IChatContextValue } from './chatContextValue'

const CREATE_CONVERSATION = (response: IChatResponse, title: string): IConversation => ({
  id: response.conversationId,
  userId: '0',
  threadId: null,
  title: title.slice(0, 40) || 'Nuevo chat',
  expiresAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
})

const WITH_CALCULATION = (response: IChatResponse): IConversationMessage => ({
  ...response.assistantMessage,
  calculation: response.assistantMessage.calculation ?? response.calculation ?? null,
})

// UN MENSAJE SOLO SE MUESTRA SI TIENE ALGO VISIBLE: TEXTO, IMAGEN O CALCULO.
// EL BACKEND GUARDA UN MENSAJE DE USUARIO VACIO AL CONFIRMAR EL CALCULO Y NO QUEREMOS UNA BURBUJA VACIA.
const HAS_VISIBLE_CONTENT = (message: IChatMessageState): boolean =>
  message.content.trim().length > 0 ||
  (message.images?.length ?? 0) > 0 ||
  (message.localImages?.length ?? 0) > 0 ||
  Boolean(message.calculation)

const FILTER_VISIBLE_MESSAGES = (items: IChatMessageState[]): IChatMessageState[] =>
  items.filter(HAS_VISIBLE_CONTENT)

const SEND_FAILURE_MESSAGE = (err: unknown, hasImages: boolean): string =>
  TO_USER_ERROR(
    err,
    hasImages
      ? 'No se pudo enviar la imagen. Probá de nuevo.'
      : 'No se pudo enviar el mensaje. Probá de nuevo.',
  )

const SORT_CONVERSATIONS = (items: IConversation[]): IConversation[] =>
  items.toSorted((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

export const ChatProvider = ({ children }: { children: ReactNode }): ReactNode => {
  const location = useLocation()
  const isChatRoute: boolean =
    location.pathname === '/panel/ia' || location.pathname.startsWith('/panel/ia/')

  const [conversations, setConversations] = useState<IConversation[]>([])
  const [activeConversation, setActiveConversation] = useState<IConversation | null>(null)
  const [messages, setMessages] = useState<IChatMessageState[]>([])
  const [isSending, setIsSending] = useState<boolean>(false)
  const [usage, setUsage] = useState<IChatUsage | null>(null)
  const [error, setError] = useState<string>('')
  const [isNewChat, setIsNewChat] = useState<boolean>(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false)
  const [newChatFocusToken, setNewChatFocusToken] = useState<number>(0)
  const [savedCalculations, setSavedCalculations] = useState<Readonly<Record<string, string>>>({})

  const noUsage: boolean = usage !== null && usage.remaining <= 0
  const composerDisabled: boolean = isSending || noUsage

  const LIST_REFRESH = useCallback(async (): Promise<void> => {
    try {
      const [nextConversations, nextUsage] = await Promise.all([fetchConversations(), fetchUsage()])
      setConversations(SORT_CONVERSATIONS(nextConversations))
      setUsage(nextUsage)
    } catch {
      return
    }
  }, [])

  useEffect(() => {
    if (!isChatRoute) return

    let isActive = true
    const LOAD_INITIAL = async (): Promise<void> => {
      try {
        const [nextConversations, nextUsage] = await Promise.all([fetchConversations(), fetchUsage()])
        if (!isActive) return
        setConversations(SORT_CONVERSATIONS(nextConversations))
        setUsage(nextUsage)
      } catch {
        return
      }
    }

    void LOAD_INITIAL()
    return () => {
      isActive = false
    }
  }, [isChatRoute])

  // MARCO EL CIERRE CON EL ID DE JORNADA QUE CONFIRMA EL BACKEND.
  const MARK_CALCULATION_SAVED = useCallback((calculationId: string, journeyId: string): void => {
    setSavedCalculations((prev) => ({ ...prev, [calculationId]: journeyId }))
  }, [])

  // CONSULTO POR ID: UN CIERRE NUEVO NUNCA HEREDA EL ESTADO DE UNO GUARDADO.
  const IS_CALCULATION_SAVED = useCallback(
    (calculationId: string): boolean => Object.hasOwn(savedCalculations, calculationId),
    [savedCalculations],
  )

  useEffect(() => {
    if (isChatRoute) return

    const timerId: number = window.setTimeout(() => {
      setIsHistoryOpen(false)
      setError('')
    }, 0)

    return () => window.clearTimeout(timerId)
  }, [isChatRoute])

  const SELECT_CONVERSATION = useCallback(async (conversation: IConversation): Promise<void> => {
    setActiveConversation(conversation)
    setIsHistoryOpen(false)
    setError('')
    setMessages([])
    try {
      const data = await fetchConversationMessages(conversation.id)
      setMessages(FILTER_VISIBLE_MESSAGES(data.messages))
      setIsNewChat(false)
    } catch (err) {
      setError(TO_USER_ERROR(err, 'No se pudo cargar la conversación.'))
      setActiveConversation(null)
    }
  }, [])

  const START_NEW_CHAT = useCallback((): void => {
    setActiveConversation(null)
    setIsNewChat(true)
    setMessages([])
    setIsHistoryOpen(false)
    setError('')
    setNewChatFocusToken((prev) => prev + 1)
  }, [])

  const DELETE_CONVERSATION = useCallback(
    async (conversationId: string): Promise<boolean> => {
      setError('')
      try {
        await DELETE_CONVERSATION_REQUEST(conversationId)
        setConversations((prev) => prev.filter((conversation) => conversation.id !== conversationId))
        if (activeConversation?.id === conversationId) {
          setActiveConversation(null)
          setMessages([])
          setIsNewChat(false)
        }
        return true
      } catch (err) {
        setError(TO_USER_ERROR(err, 'No se pudo eliminar la conversación.'))
        return false
      }
    },
    [activeConversation],
  )

  const SEND_MESSAGE = useCallback(
    async (text: string, imagesData: string[]): Promise<boolean> => {
      setError('')
      setIsSending(true)

      const tempId: string = `temp-${crypto.randomUUID()}`
      const tempMessage: IChatMessageState = {
        id: tempId,
        conversationId: activeConversation?.id ?? `id-${crypto.randomUUID()}`,
        role: 'user',
        content: text,
        createdAt: new Date().toISOString(),
        images: [],
        localImages: imagesData,
        sendStatus: 'sending',
      }
      setMessages((prev) => [...prev, tempMessage])

      try {
        const response = await sendChatMessage({
          message: text,
          imagesData,
          conversationId: activeConversation?.id,
        })

        if (!activeConversation) {
          setActiveConversation(CREATE_CONVERSATION(response, text))
        }

        setMessages((prev) =>
          FILTER_VISIBLE_MESSAGES([
            ...prev.filter((message) => message.id !== tempId),
            response.userMessage,
            WITH_CALCULATION(response),
          ]),
        )
        void LIST_REFRESH()
        return true
      } catch (err) {
        setError(SEND_FAILURE_MESSAGE(err, imagesData.length > 0))
        setMessages((prev) =>
          prev.map((message) =>
            message.id === tempId ? { ...message, sendStatus: 'failed' } : message,
          ),
        )
        return false
      } finally {
        setIsSending(false)
      }
    },
    [activeConversation, LIST_REFRESH],
  )

  const CONFIRM_CALCULATION = useCallback(
    async (conversationId: string): Promise<boolean> => {
      setError('')
      setIsSending(true)

      try {
        const response = await sendChatMessage({ conversationId, confirmCalculation: true })

        if (!activeConversation) {
          setActiveConversation(CREATE_CONVERSATION(response, 'Cierre de jornada'))
        }

        setMessages((prev) =>
          FILTER_VISIBLE_MESSAGES([...prev, response.userMessage, WITH_CALCULATION(response)]),
        )
        void LIST_REFRESH()
        return true
      } catch (err) {
        setError(TO_USER_ERROR(err, 'No se pudo confirmar el cálculo. Probá de nuevo.'))
        return false
      } finally {
        setIsSending(false)
      }
    },
    [activeConversation, LIST_REFRESH],
  )

  const OPEN_HISTORY = useCallback((): void => {
    setIsHistoryOpen(true)
  }, [])

  const CLOSE_HISTORY = useCallback((): void => {
    setIsHistoryOpen(false)
  }, [])

  const VALUE = useMemo<IChatContextValue>(
    () => ({
      conversations,
      activeConversation,
      messages,
      isSending,
      usage,
      error,
      isNewChat,
      isHistoryOpen,
      isChatRoute,
      noUsage,
      composerDisabled,
      newChatFocusToken,
      selectConversation: SELECT_CONVERSATION,
      startNewChat: START_NEW_CHAT,
      deleteConversation: DELETE_CONVERSATION,
      sendMessage: SEND_MESSAGE,
      confirmCalculation: CONFIRM_CALCULATION,
      isCalculationSaved: IS_CALCULATION_SAVED,
      markCalculationSaved: MARK_CALCULATION_SAVED,
      openHistory: OPEN_HISTORY,
      closeHistory: CLOSE_HISTORY,
      refreshList: LIST_REFRESH,
    }),
    [
      conversations,
      activeConversation,
      messages,
      isSending,
      usage,
      error,
      isNewChat,
      isHistoryOpen,
      isChatRoute,
      noUsage,
      composerDisabled,
      newChatFocusToken,
      SELECT_CONVERSATION,
      START_NEW_CHAT,
      DELETE_CONVERSATION,
      SEND_MESSAGE,
      CONFIRM_CALCULATION,
      IS_CALCULATION_SAVED,
      MARK_CALCULATION_SAVED,
      OPEN_HISTORY,
      CLOSE_HISTORY,
      LIST_REFRESH,
    ],
  )

  return <ChatContext.Provider value={VALUE}>{children}</ChatContext.Provider>
}
