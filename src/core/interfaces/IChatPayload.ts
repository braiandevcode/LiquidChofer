// Payload que se envia al endpoint POST /api/v1/ai/chat.
export interface IChatPayload {
  message?: string
  conversationId?: string
  imagesData?: string[]
  confirmCalculation?: boolean
}