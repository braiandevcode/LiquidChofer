import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import type { IChatMessageState } from '../../../../core/interfaces/IChatMessageState'
import type { ICalculationState } from '../../../../core/interfaces/ICalculationState'
import LoadingDots from '../../../../shared/styles/LoadingDots'
import ImagePreviewModal from '../../../../shared/components/ImagePreviewModal'
import { cn } from '../../../../shared/lib/utils'
import { FORMAT_TIME } from './chat.utils'
import MarkdownMessage from './MarkDownMessage'
import CalculationCard from './calculation/CalculationCard'

interface IChatMessageListProps {
  messages: IChatMessageState[]
  isSending: boolean
  confirmDisabled: boolean
  onConfirmCalculation: (conversationId: string) => Promise<boolean>
  onSaveCalculation: (calculation: ICalculationState) => void
  savedCalculationId: string | null
}

interface IRenderedImage {
  id: string
  src: string
}

interface IMessageThumbnailProps {
  image: IRenderedImage
  index: number
  onOpen: (image: IRenderedImage) => void
}

// MINIATURA INTERACTIVA QUE ABRE LA IMAGEN EN GRANDE AL TOCARLA.
const MessageThumbnail = ({ image, index, onOpen }: IMessageThumbnailProps): ReactNode => {
  const HANDLE_CLICK = useCallback((): void => onOpen(image), [image, onOpen])

  return (
    <button
      type="button"
      onClick={HANDLE_CLICK}
      aria-label={`Ampliar imagen ${index + 1}`}
      className="cursor-zoom-in touch-manipulation rounded-xl transition-transform active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-violet focus-visible:ring-offset-2 focus-visible:ring-offset-bg-card"
    >
      <img
        src={image.src}
        alt={`Imagen adjunta ${index + 1}`}
        className="h-20 w-20 rounded-xl border border-border-subtle object-cover md:h-24 md:w-24"
      />
    </button>
  )
}

// IMAGENES DEL MENSAJE: PRIORIZO LAS PERSISTIDAS (url firmada) ORDENADAS POR position.
// SI AUN NO HAY RESPUESTA DEL BACKEND USO LAS LOCALES (BURBUJA OPTIMISTA).
const MESSAGE_IMAGES = (message: IChatMessageState): IRenderedImage[] => {
  const persisted: IRenderedImage[] = (message.images ?? [])
    .toSorted((a, b) => a.position - b.position)
    .map((image) => ({ id: image.id, src: image.url }))
  if (persisted.length > 0) return persisted
  return (message.localImages ?? []).map((src, index) => ({ id: `local-${index}`, src }))
}

// TEXTO DE ERROR SEGUN SI EL MENSAJE FALLIDO LLEVABA IMAGEN O NO.
const FAILED_SEND_LABEL = (hasImages: boolean): string =>
  hasImages ? '— No se pudo enviar la imagen —' : '— No se pudo enviar el mensaje —'

// ID DEL ULTIMO MENSAJE CON CALCULO PARA HABILITAR SOLO LA OFERTA VIGENTE.
const LATEST_CALCULATION_ID = (messages: IChatMessageState[]): string | null => {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (messages[index].calculation) return messages[index].id
  }
  return null
}

// LISTA DE BURBUJAS DEL CHAT: EL USUARIO A LA DERECHA Y LA IA A LA IZQUIERDA.
const ChatMessageList = ({
  messages,
  isSending,
  confirmDisabled,
  onConfirmCalculation,
  onSaveCalculation,
  savedCalculationId,
}: IChatMessageListProps): ReactNode => {
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const [previewImage, setPreviewImage] = useState<IRenderedImage | null>(null)
  const latestCalculationId: string | null = LATEST_CALCULATION_ID(messages)

  const HANDLE_OPEN_PREVIEW = useCallback((image: IRenderedImage): void => setPreviewImage(image), [])
  const HANDLE_CLOSE_PREVIEW = useCallback((): void => setPreviewImage(null), [])

  // MANTENGO EL SCROLL PEGADO AL ULTIMO MENSAJE
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isSending])

  return (
    <div className="chat-scrollbar flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 py-4 md:px-5">
      {messages.map((message) => {
        const isUser: boolean = message.role === 'user'
        const messageImages: IRenderedImage[] = MESSAGE_IMAGES(message)
        return (
          <div key={message.id} className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
            <div
              className={cn(
                'max-w-[85%] rounded-2xl px-3.5 py-2.5 md:max-w-[75%]',
                isUser
                  ? 'rounded-br-md bg-accent-violet/20 border border-accent-violet/20'
                  : 'rounded-bl-md card-glass border border-border-subtle',
              )}
            >
              {messageImages.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {messageImages.map((image, index) => (
                    <MessageThumbnail key={image.id} image={image} index={index} onOpen={HANDLE_OPEN_PREVIEW} />
                  ))}
                </div>
              )}
              {isUser ? (
                <>
                  {message.content && (
                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-text-primary">
                      {message.content}
                    </p>
                  )}
                </>
              ) : (
                // RESPUESTA DE LA IA: MARKDOWN (SIN pre-wrap PARA NO DUPLICAR LOS SALTOS DE LINEA)
                <>
                  <div className="break-words text-sm leading-relaxed text-text-primary">
                    <MarkdownMessage content={message.content} />
                  </div>
                  {message.calculation && (
                    <CalculationCard
                      calculation={message.calculation}
                      conversationId={message.conversationId}
                      canConfirm={message.id === latestCalculationId}
                      confirmDisabled={confirmDisabled}
                      onConfirm={onConfirmCalculation}
                      onSave={onSaveCalculation}
                      isSaved={savedCalculationId === message.calculation.id}
                    />
                  )}
                </>
              )}
              {message.sendStatus === 'failed' && (
                <p role="alert" className="mt-1 text-[11px] font-medium text-accent-red">
                  {FAILED_SEND_LABEL(messageImages.length > 0)}
                </p>
              )}
              <span className="mt-1 block text-right text-[11px] font-medium text-text-muted">
                {FORMAT_TIME(message.createdAt)}
              </span>
            </div>
          </div>
        )
      })}

      {isSending && (
        <div className="flex justify-start">
          <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-border-subtle bg-bg-card px-3.5 py-2.5">
            <LoadingDots size="w-1.5 h-1.5" />
          </div>
        </div>
      )}

      <div ref={bottomRef} />

      <ImagePreviewModal
        src={previewImage?.src ?? ''}
        alt="Imagen del chat ampliada"
        isOpen={previewImage !== null}
        onClose={HANDLE_CLOSE_PREVIEW}
      />
    </div>
  )
}

export default ChatMessageList
