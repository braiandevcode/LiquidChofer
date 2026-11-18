import { useCallback, useEffect, type MouseEvent, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { useFocusTrap } from '../hooks/useFocusTrap'
import IconButton from '../styles/IconButton'
import ModalPortal from './ModalPortal'
import type { IImagePreviewModalProps } from '../interfaces/props/IImagePreviewModalProps'

// MODAL REUTILIZABLE PARA VER UNA IMAGEN EN TAMANO GRANDE.
const ImagePreviewModal = ({
  src,
  alt = 'Imagen ampliada',
  isOpen,
  onClose,
}: IImagePreviewModalProps): ReactNode => {
  const modalRef = useFocusTrap(isOpen)

  // BLOQUEO EL SCROLL DEL BODY Y CIERRO CON ESCAPE MIENTRAS EL MODAL ESTA ABIERTO.
  const HANDLE_MODAL_EFFECTS = (): (() => void) | undefined => {
    if (!isOpen) return undefined
    document.body.classList.add('overflow-hidden')

    const HANDLE_ESCAPE = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', HANDLE_ESCAPE)

    return () => {
      document.body.classList.remove('overflow-hidden')
      document.removeEventListener('keydown', HANDLE_ESCAPE)
    }
  }
  useEffect(HANDLE_MODAL_EFFECTS, [isOpen, onClose])

  // CIERRO SOLO CUANDO EL CLICK FUE SOBRE EL FONDO, NO SOBRE LA IMAGEN.
  const HANDLE_BACKDROP_CLICK = useCallback(
    (event: MouseEvent<HTMLDivElement>): void => {
      if (event.target === event.currentTarget) onClose()
    },
    [onClose],
  )

  if (!isOpen) return null

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 p-4 animate-fade-in"
        onClick={HANDLE_BACKDROP_CLICK}
      >
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          className="relative flex max-h-[calc(100dvh-2rem)] max-w-[calc(100vw-2rem)] items-center justify-center"
        >
          <IconButton
            onClick={onClose}
            ariaLabel="Cerrar vista previa"
            size="md"
            autoFocus
            className="absolute -right-2 -top-2 z-10 border border-border-subtle bg-bg-card/90 text-text-primary hover:bg-bg-hover"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </IconButton>

          <img
            src={src}
            alt={alt}
            className="max-h-[calc(100dvh-2rem)] max-w-[calc(100vw-2rem)] rounded-xl object-contain shadow-2xl animate-scale-in"
          />
        </div>
      </div>
    </ModalPortal>
  )
}

export default ImagePreviewModal
