// BLOQUEO EL SCROLL DEL BODY MIENTRAS UN MODAL ESTA ABIERTO Y LO LIBERO AL DESMONTAR.
export const BLOCK_BODY_SCROLL = (isOpen: boolean): (() => void) => {
  if (isOpen) {
    document.body.classList.add('overflow-hidden')
  } else {
    document.body.classList.remove('overflow-hidden')
  }
  return () => document.body.classList.remove('overflow-hidden')
}
