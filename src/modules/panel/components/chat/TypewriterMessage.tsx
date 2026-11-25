import { useEffect, useRef, useState, type ReactNode } from 'react'
import MarkdownMessage from './MarkDownMessage'

interface ITypewriterMessageProps {
  content: string
  animate: boolean
  children?: ReactNode
  onProgress?: () => void
}

const MIN_DURATION = 350
const MAX_DURATION = 2200
const MS_PER_CHAR = 16
const CARET = '▍'

const REDUCED_MOTION = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const SHOULD_ANIMATE = (content: string, animate: boolean): boolean =>
  animate && content.trim().length > 0 && !REDUCED_MOTION()

// REVELA LA RESPUESTA COMO SI SE ESTUVIERA REDACTANDO; SOLO PARA MENSAJES RECIEN LLEGADOS.
const TypewriterMessage = ({
  content,
  animate,
  children,
  onProgress,
}: ITypewriterMessageProps): ReactNode => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(REDUCED_MOTION)
  const [visibleLength, setVisibleLength] = useState<number>(() =>
    SHOULD_ANIMATE(content, animate) ? 0 : content.length,
  )
  const frameRef = useRef<number | null>(null)
  const lastLengthRef = useRef<number>(visibleLength)

  useEffect(() => {
    const media: MediaQueryList = window.matchMedia('(prefers-reduced-motion: reduce)')
    const HANDLE_CHANGE = (event: MediaQueryListEvent): void => setPrefersReducedMotion(event.matches)
    media.addEventListener('change', HANDLE_CHANGE)
    return () => media.removeEventListener('change', HANDLE_CHANGE)
  }, [])

  const shouldAnimate: boolean = animate && content.trim().length > 0 && !prefersReducedMotion

  useEffect(() => {
    if (!shouldAnimate) return

    const duration: number = Math.min(
      MAX_DURATION,
      Math.max(MIN_DURATION, content.length * MS_PER_CHAR),
    )
    const startedAt: number = performance.now()
    lastLengthRef.current = 0

    const tick = (now: number): void => {
      const progress: number = Math.min(1, (now - startedAt) / duration)
      const eased: number = 1 - Math.pow(1 - progress, 1.4)
      const nextLength: number = Math.ceil(eased * content.length)

      if (nextLength !== lastLengthRef.current) {
        lastLengthRef.current = nextLength
        setVisibleLength(nextLength)
        onProgress?.()
      }

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick)
      } else {
        frameRef.current = null
      }
    }

    frameRef.current = requestAnimationFrame(tick)

    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
      frameRef.current = null
      lastLengthRef.current = 0
    }
  }, [content, shouldAnimate, onProgress])

  const displayLength: number = shouldAnimate ? visibleLength : content.length
  const isTyping: boolean = shouldAnimate && displayLength < content.length
  const visibleContent: string = isTyping ? `${content.slice(0, displayLength)}${CARET}` : content

  return (
    <>
      {isTyping ? (
        <>
          <div
            aria-hidden="true"
            inert
            className="break-words text-sm leading-relaxed text-text-primary"
          >
            <MarkdownMessage content={visibleContent} />
          </div>
          <p aria-live="polite" className="sr-only">
            {content}
          </p>
        </>
      ) : (
        <div className="break-words text-sm leading-relaxed text-text-primary">
          <MarkdownMessage content={content} />
        </div>
      )}
      {!isTyping && children}
    </>
  )
}

export default TypewriterMessage
