// Cuota diaria restante del usuario.
export interface IChatUsage {
  limit: number
  used: number
  remaining: number
}