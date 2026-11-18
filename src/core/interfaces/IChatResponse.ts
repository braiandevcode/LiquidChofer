import type { ICalculationState } from "./ICalculationState"
import type { IConversationMessage } from "./IConversationMessage"

// Respuesta del endpoint POST /api/v1/ai/chat.
export interface IChatResponse {
  conversationId: string
  reply: string
  userMessage: IConversationMessage
  assistantMessage: IConversationMessage
  calculation?: ICalculationState | null
}