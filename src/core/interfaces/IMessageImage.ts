// Imagen persistida de un mensaje. La url firmada se usa tal cual.
export interface IMessageImage {
  id: string
  position: number
  createdAt?: string
  url: string
}