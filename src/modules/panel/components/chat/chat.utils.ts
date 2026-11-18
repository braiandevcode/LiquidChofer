// LEE EL ARCHIVO COMO DATA URL Y LO REDIMENSIONA PARA NO ABUSAR DE LA API DE LA IA
export const FILE_TO_RESIZED_DATA_URL = async (file: File, maxSize = 1280): Promise<string> => {
  const dataUrl: string = await READ_IMAGE_AS_DATA_URL(file)
  return RESIZE_DATA_URL(dataUrl, maxSize)
}

// LEE EL ARCHIVO COMO DATA URL BASE64
const READ_IMAGE_AS_DATA_URL = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader: FileReader = new FileReader()
    reader.onload = (): void => resolve(reader.result as string)
    reader.onerror = (): void => reject(reader.error ?? new Error('No se pudo leer la imagen.'))
    reader.readAsDataURL(file) // CARGO LA IMAGEN EN MEMORIA
  })

// REDIMENSIONA Y RE-CODIFICA SIEMPRE A JPEG (DESCARTA METADATOS Y CONTENIDO INCRUSTADO)
const RESIZE_DATA_URL = (dataUrl: string, maxSize: number): Promise<string> =>
  new Promise((resolve, reject) => {
    const image: HTMLImageElement = new Image()
    image.onload = (): void => {
      if (!image.width || !image.height) {
        reject(new Error('Imagen inválida.'))
        return
      }
      const scale: number = Math.min(1, maxSize / Math.max(image.width, image.height))
      const canvas: HTMLCanvasElement = document.createElement('canvas')
      canvas.width = Math.round(image.width * scale)
      canvas.height = Math.round(image.height * scale)
      const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('No se pudo procesar la imagen.'))
        return
      }
      ctx.fillStyle = '#ffffff' // FONDO BLANCO: JPEG NO SOPORTA TRANSPARENCIA
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', 0.8))
    }
    image.onerror = (): void => reject(new Error('El archivo no es una imagen válida.'))
    image.src = dataUrl
  })

// HORA CORTA DE UN TIMESTAMP PARA LAS BURBUJAS
export const FORMAT_TIME = (iso: string): string =>
  new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit' }).format(new Date(iso))

// TIEMPO RELATIVO CORTO PARA EL LISTADO DE CONVERSACIONES
export const FORMAT_RELATIVE_TIME = (iso: string): string => {
  const diffMs: number = Date.now() - new Date(iso).getTime()
  const minutes: number = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'ahora'
  if (minutes < 60) return `hace ${minutes} min`
  const hours: number = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours} h`
  const days: number = Math.floor(hours / 24)
  return `hace ${days} d`
}