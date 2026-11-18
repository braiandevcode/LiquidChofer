import { useCallback, useState, type ReactNode, type SubmitEvent } from 'react'
import { useNavigate, type NavigateFunction } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { useAuth } from '../../../../core/context/AuthContext'
import { deleteAccount } from '../../../../core/services/auth.service'
import StatusBanner from '../../../../shared/styles/StatusBanner'
import Button from '../../../../shared/ui/Button'
import LoadingDots from '../../../../shared/styles/LoadingDots'

const CONFIRM_WORD: string = 'ELIMINAR'

const INPUT_CLASSES: string =
  'w-full rounded-xl input-glass px-4 py-3.5 text-base font-semibold text-text-primary placeholder:text-text-muted/70 font-display tracking-wide disabled:opacity-60 disabled:cursor-not-allowed'

const DeleteAccountForm = (): ReactNode => {
  const { user, signOut } = useAuth()
  const navigate: NavigateFunction = useNavigate()
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [confirmText, setConfirmText] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [formError, setFormError] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const hasPassword: boolean = user?.hasPassword === true

  const handleClose = useCallback((): void => {
    setIsOpen(false)
    setConfirmText('')
    setPassword('') // NO DEJO LA CONTRASEÑA EN MEMORIA
    setFormError('')
  }, [])

  const handleSubmit = useCallback(async (event: SubmitEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    setFormError('')

    if (!user?.email) {
      setFormError('No pudimos obtener tu correo. Recargá la página.')
      return
    }
    if (confirmText !== CONFIRM_WORD) {
      setFormError(`Escribí ${CONFIRM_WORD} para confirmar.`)
      return
    }
    if (hasPassword && !password) {
      setFormError('Ingresá tu contraseña actual.')
      return
    }

    setIsSubmitting(true)
    try {
      await deleteAccount(user.email, hasPassword, password)
      await signOut().catch(() => undefined) // LIMPIO EL ESTADO LOCAL (LA COOKIE YA SE BORRO EN EL BACKEND)
      navigate('/', { replace: true })
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'No se pudo eliminar la cuenta. Intentá de nuevo.')
      setIsSubmitting(false)
    }
  }, [user, confirmText, password, hasPassword, signOut, navigate])

  return (
    <div className="flex flex-col gap-3">
      {!isOpen ? (
        <Button
          variant="ghost"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center justify-center gap-2"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Eliminar cuenta
        </Button>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 animate-fade-in" noValidate>
          <StatusBanner variant="warning">
            Esta acción es permanente: se borran tu cuenta, tus conversaciones y tus imágenes. No se puede deshacer.
          </StatusBanner>

          {hasPassword ? (
            <div>
              <label htmlFor="del-password" className="text-sm font-bold text-text-primary font-display">
                Contraseña actual
              </label>
              <input
                id="del-password"
                type="password"
                autoComplete="current-password"
                value={password}
                disabled={isSubmitting}
                className={INPUT_CLASSES}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          ) : (
            <p className="text-sm text-text-secondary">
              Al confirmar se abrirá una ventana de Google para verificar que sos vos.
            </p>
          )}

          <div>
            <label htmlFor="del-confirm" className="text-sm font-bold text-text-primary font-display">
              Escribí {CONFIRM_WORD} para confirmar
            </label>
            <input
              id="del-confirm"
              type="text"
              autoComplete="off"
              value={confirmText}
              disabled={isSubmitting}
              className={INPUT_CLASSES}
              onChange={(e) => setConfirmText(e.target.value)}
            />
          </div>

          {formError && <StatusBanner variant="error">{formError}</StatusBanner>}

          <Button type="submit" variant="danger" disabled={isSubmitting} className="flex items-center justify-center gap-2">
            {isSubmitting ? <LoadingDots /> : 'Eliminar mi cuenta definitivamente'}
          </Button>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="mx-auto text-sm font-medium text-text-secondary hover:text-accent-violet transition-colors cursor-pointer font-display disabled:opacity-50"
          >
            Cancelar
          </button>
        </form>
      )}
    </div>
  )
}

export default DeleteAccountForm