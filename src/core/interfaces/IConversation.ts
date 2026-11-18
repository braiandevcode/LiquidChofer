// Conversacion del usuario con la IA.
export interface IConversation {
  id: string
  userId: string
  threadId: string | null
  title: string | null
  expiresAt: string
  createdAt: string
}
