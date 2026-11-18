import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react'
import { ImagePlus, Send, X } from 'lucide-react'
import { cn } from '../../../../shared/lib/utils'
import { FILE_TO_RESIZED_DATA_URL } from './chat.utils'

interface IChatComposerProps {
  onSend: (text: string, imagesData: string[]) => Promise<boolean>
  disabled?: boolean
  isSending?: boolean
}

// PERMITO QUE EL PADRE PONGA EL FOCO EN LA ENTRADA (EJ: AL EMPEZAR UN CHAT NUEVO)
export interface IChatComposerHandle {
  focus: () => void
}

interface IAttachedImage {
  id: string
  src: string
}


// FORMATOS PERMITIDOS: SOLO RASTER (SVG PUEDE LLEVAR SCRIPTS) Y TOPES DE TAMAÑO/LONGITUD
const ALLOWED_IMAGE_TYPES: string[] = ['image/jpeg', 'image/png', 'image/webp']
const MAX_IMAGE_BYTES: number = 8 * 1024 * 1024
const MAX_TEXT_LENGTH: number = 2000
const MAX_IMAGES: number = 3

// ENTRADA DEL CHAT: TEXTO AUTOEXPANSIBLE + BOTON DE AÑADIR IMAGEN + ENVIAR.
const ChatComposer = forwardRef<IChatComposerHandle, IChatComposerProps>(function ChatComposer(
  { onSend, disabled = false, isSending = false },
  ref,
): ReactNode {
  const [text, setText] = useState<string>('')
  const [images, setImages] = useState<IAttachedImage[]>([])
  const [imageError, setImageError] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const fileInputRef: RefObject<HTMLInputElement | null> = useRef<HTMLInputElement>(null)
  const textareaRef: RefObject<HTMLTextAreaElement | null> = useRef<HTMLTextAreaElement>(null)

  useImperativeHandle(
    ref,
    () => ({
      focus: (): void => {
        textareaRef.current?.focus()
      },
    }),
    [],
  )

  // AJUSTO LA ALTURA DEL TEXTAREA SEGUN EL CONTENIDO (TOPE 120PX)
  const HANDLE_AUTO_RESIZE = useCallback((value: string): void => {
    const el: HTMLTextAreaElement | null = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
    setText(value)
  }, [])

  // LEE LA IMAGEN SELECCIONADA, LA VALIDA, LA REDIMENSIONA Y LA DEJA LISTA PARA ENVIAR
  const HANDLE_FILE_CHANGE = useCallback(
    async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
      const files: File[] = Array.from(event.target.files ?? [])
      event.target.value = '' // PERMITO REUSAR EL MISMO ARCHIVO
      setImageError('')

      if (files.length === 0) return

      const freeSlots: number = MAX_IMAGES - images.length
      if (files.length > freeSlots) {
        setImageError(`Podés adjuntar hasta ${MAX_IMAGES} imágenes.`)
      }

      const added: IAttachedImage[] = []
      for (const file of files.slice(0, freeSlots)) {
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
          setImageError('Formato no permitido. Usá JPG, PNG o WEBP.')
          continue
        }
        if (file.size > MAX_IMAGE_BYTES) {
          setImageError('Una de las imágenes es demasiado grande. Elegí una más liviana.')
          continue
        }
        try {
          const resized: string = await FILE_TO_RESIZED_DATA_URL(file)
          if (resized.length > 9_000_000) {
            setImageError('Una de las imágenes es demasiado grande. Elegí una más liviana.')
            continue
          }
          added.push({ id: crypto.randomUUID(), src: resized })
        } catch {
          setImageError('No se pudo leer una de las imágenes. Probá con otra.')
        }
      }
      if (added.length > 0) setImages((prev) => [...prev, ...added].slice(0, MAX_IMAGES))
    },
    [images.length],
  )

  // ENVIO EL MENSAJE (CON IMAGEN SI HAY) Y LIMPIO LA ENTRADA AL TERMINAR EL INTENTO
  const HANDLE_SEND = useCallback(async (): Promise<void> => {
    const trimmed: string = text.trim().slice(0, MAX_TEXT_LENGTH)
    if (disabled) return
    if (!trimmed && images.length === 0) return
    const sentImagesData: string[] = images.map((image) => image.src)
    setIsSubmitting(true)
    try {
      await onSend(trimmed, sentImagesData)
    } finally {
      // LIMPIO LA ENTRADA SIEMPRE: EL MENSAJE YA QUEDA EN EL CHAT (EXITO O FALLO)
      setText('')
      setImages([])
      setImageError('')
      const el: HTMLTextAreaElement | null = textareaRef.current
      if (el) el.style.height = 'auto'
      setIsSubmitting(false)
    }
  }, [text, images, disabled, onSend])

  // ENTER ENVIA; SHIFT+ENTER HACE SALTO DE LINEA
  const HANDLE_KEY_DOWN = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>): void => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        // EL ENTER DE IME CONFIRMA LA COMPOSICION: NO DEBE ENVIAR EL MENSAJE
        if (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) return
        void HANDLE_SEND()
      }
    },
    [HANDLE_SEND],
  )

  return (
    <div className="border-t border-border-subtle bg-bg-deep/60 p-3 md:p-4">
      {images.length > 0 && !isSending && !isSubmitting && (
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {images.map((image, index) => (
            <div key={image.id} className="relative">
              <img
                src={image.src}
                alt={`Imagen adjunta ${index + 1}`}
                className="h-16 w-16 rounded-xl border border-border-subtle object-cover md:h-14 md:w-14"
              />
              <button
                type="button"
                onClick={() => setImages((prev) => prev.filter((item) => item.id !== image.id))}
                aria-label={`Quitar imagen ${index + 1}`}
                className="absolute -right-2 -top-2 flex h-7 w-7 touch-manipulation items-center justify-center rounded-full bg-accent-red text-white transition-colors cursor-pointer hover:bg-accent-red/80 active:scale-95 md:h-5 md:w-5"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </div>
          ))}
          <span className="text-xs font-medium text-text-secondary">
            {images.length} de {MAX_IMAGES} imágenes
          </span>
        </div>
      )}

      {imageError && <p className="mb-2 text-xs font-medium text-accent-red">{imageError}</p>}

      <div className="flex items-end gap-2">
        <div className="flex flex-1 items-end rounded-2xl border border-border-subtle bg-bg-card px-3 py-2 focus-within:border-accent-violet/40 transition-colors">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => HANDLE_AUTO_RESIZE(e.target.value)}
            onKeyDown={HANDLE_KEY_DOWN}
            rows={1}
            maxLength={MAX_TEXT_LENGTH}
            disabled={disabled}
            placeholder={disabled ? 'Esperando respuesta...' : 'Escribile a ChófIA...'}
            aria-label="Mensaje para la IA"
            className="max-h-[120px] flex-1 resize-none bg-transparent text-base leading-relaxed text-text-primary placeholder:text-text-muted/70 font-display outline-none disabled:opacity-60 disabled:cursor-not-allowed md:text-sm"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || images.length >= MAX_IMAGES}
            aria-label="Adjuntar imagen"
            title="Adjuntar imagen"
            className="flex h-10 w-10 shrink-0 touch-manipulation items-center justify-center rounded-xl text-text-secondary transition-colors cursor-pointer hover:bg-bg-hover hover:text-accent-violet active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed md:h-9 md:w-9"
          >
            <ImagePlus className="h-5 w-5" aria-hidden="true" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_IMAGE_TYPES.join(',')}
            onChange={(e) => void HANDLE_FILE_CHANGE(e)}
            className="hidden"
            multiple
          />
        </div>

        <button
          type="button"
          onClick={() => void HANDLE_SEND()}
          disabled={disabled || (!text.trim() && (images.length === 0))}
          aria-label="Enviar mensaje"
          className={cn(
            'flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-2xl bg-accent-violet text-white shadow-glow-violet transition-all duration-200 active:scale-[0.97] cursor-pointer',
            'disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none hover:brightness-110',
          )}
        >
          <Send className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
})

ChatComposer.displayName = 'ChatComposer'

export default ChatComposer
