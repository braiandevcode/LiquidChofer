import type { ICalculationState } from "./ICalculationState"
import type { IMessageImage } from "./IMessageImage"

// Mensaje individual dentro de una conversacion.
export interface IConversationMessage {
  id: string
  conversationId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt: string
  images: IMessageImage[]
  localImages?: string[]
  calculation?: ICalculationState | null
}
