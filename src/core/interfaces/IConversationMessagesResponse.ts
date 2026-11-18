import type { IConversation } from "./IConversation"
import type { IConversationMessage } from "./IConversationMessage"

// Respuesta del endpoint GET /api/v1/ai/conversations/:id/messages.
export interface IConversationMessagesResponse {
  conversation: IConversation
  messages: IConversationMessage[]
}