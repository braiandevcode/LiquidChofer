import { ArrowUp } from 'lucide-react'
import { useCallback, useEffect, useState, type ReactNode } from 'react'

const SCROLL_THRESHOLD: number = 480

// UNA SOLA SALIDA FLOTANTE PARA PAGINAS LARGAS: APARECE DESPUES DE SCROLL.
const BackToTopButton = (): ReactNode => {
  const [isVisible, setIsVisible] = useState<boolean>(false)

  const TRACK_SCROLL = (): (() => void) => {
    const handleScroll = (): void => setIsVisible(window.scrollY > SCROLL_THRESHOLD)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }
  useEffect(TRACK_SCROLL, [])

  const HANDLE_BACK_TO_TOP = useCallback((): void => {
    window.scrollTo({ top: 0 })
  }, [])

  if (!isVisible) return null

  return (
    <button
      type="button"
      onClick={HANDLE_BACK_TO_TOP}
      aria-label="Volver al inicio de la página"
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-40 inline-flex min-h-11 touch-manipulation animate-fade-in-up cursor-pointer items-center gap-2 rounded-full bg-accent-violet px-4 py-2 font-display text-sm font-bold text-white shadow-glow-violet transition-all duration-200 hover:brightness-110 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg-deep"
    >
      <ArrowUp className="h-4 w-4 shrink-0" aria-hidden="true" />
      Volver arriba
    </button>
  )
}

export default BackToTopButton
