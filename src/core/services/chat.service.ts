import type { IChatPayload } from '../interfaces/IChatPayload'
import type { IChatResponse } from '../interfaces/IChatResponse'
import type { IChatUsage } from '../interfaces/IChatUsage'
import type { IConversation } from '../interfaces/IConversation'
import type { IConversationMessagesResponse } from '../interfaces/IConversationMessagesResponse'
import { API_FETCH } from './api'

// OPCIONES PARA ENVIAR UN MENSAJE AL CHAT DE LA IA.
export interface ISendChatMessageOptions {
  message?: string
  imagesData?: string[]
  conversationId?: string
  confirmCalculation?: boolean
}

// ENVIO UN MENSAJE AL CHAT DE LA IA. Las imágenes opcionales viajan como data URL.
export const sendChatMessage = async ({
  message,
  imagesData = [],
  conversationId,
  confirmCalculation = false,
}: ISendChatMessageOptions = {}): Promise<IChatResponse> => {
  const payload: IChatPayload = {}
  if (message) payload.message = message
  if (conversationId) payload.conversationId = conversationId
  if (imagesData.length > 0) payload.imagesData = imagesData // IMAGENES ADJUNTAS (COMPROBANTE, ETC)
  if (confirmCalculation) payload.confirmCalculation = true // CONFIRMA EL CALCULO OFRECIDO

  return API_FETCH<IChatResponse>('/api/v1/ai/chat', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// LISTO LAS CONVERSACIONES VIGENTES DEL USUARIO (EL BACKEND LIMITA SU CANTIDAD/TTL).
export const fetchConversations = async (): Promise<IConversation[]> =>
  API_FETCH<IConversation[]>('/api/v1/ai/conversations')

// CARGAR EL HISTORIAL DE MENSAJES DE UNA CONVERSACION.
export const fetchConversationMessages = async (
  conversationId: string,
): Promise<IConversationMessagesResponse> =>
  API_FETCH<IConversationMessagesResponse>(`/api/v1/ai/conversations/${conversationId}/messages`)

// ELIMINA UNA CONVERSACION DEL USUARIO.
export const deleteConversation = async (conversationId: string): Promise<void> =>
  API_FETCH<void>(`/api/v1/ai/conversations/${conversationId}`, { method: 'DELETE' })

// CONSULTA LA CUOTA DIARIA RESTANTE.
export const fetchUsage = async (): Promise<IChatUsage> => API_FETCH<IChatUsage>('/api/v1/ai/usage')