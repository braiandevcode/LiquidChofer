import { useCallback, useState, type ReactNode, type SubmitEvent } from 'react'
import { Lock } from 'lucide-react'
import { useAuth } from '../../../../core/context/AuthContext'
import { changePassword } from '../../../../core/services/auth.service'
import StatusBanner from '../../../../shared/styles/StatusBanner'
import Button from '../../../../shared/ui/Button'
import LoadingDots from '../../../../shared/styles/LoadingDots'

const MIN_LENGTH: number = 8

const INPUT_CLASSES: string =
  'w-full rounded-xl input-glass px-4 py-3.5 text-base font-semibold text-text-primary placeholder:text-text-muted/70 font-display tracking-wide disabled:opacity-60 disabled:cursor-not-allowed'

const ChangePasswordForm = (): ReactNode => {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [currentPassword, setCurrentPassword] = useState<string>('')
  const [newPassword, setNewPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [formError, setFormError] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const handleClose = useCallback((): void => {
    setIsOpen(false)
    setCurrentPassword('') // NO DEJO LAS CONTRASEÑAS EN MEMORIA
    setNewPassword('')
    setConfirmPassword('')
    setFormError('')
  }, [])

  const handleSubmit = useCallback(async (event: SubmitEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    setFormError('')
    setSuccessMessage('')

    if (!user?.email) {
      setFormError('No pudimos obtener tu correo. Recargá la página.')
      return
    }
    if (!currentPassword) {
      setFormError('Ingresá tu contraseña actual.')
      return
    }
    if (newPassword.length < MIN_LENGTH) {
      setFormError(`La nueva contraseña debe tener al menos ${MIN_LENGTH} caracteres.`)
      return
    }
    if (newPassword !== confirmPassword) {
      setFormError('Las contraseñas nuevas no coinciden.')
      return
    }

    setIsSubmitting(true)
    try {
      await changePassword(user.email, currentPassword, newPassword)
      handleClose()
      setSuccessMessage('Tu contraseña se actualizó correctamente.')
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'No se pudo cambiar la contraseña. Intentá de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }, [user, currentPassword, newPassword, confirmPassword, handleClose])

  if (user?.hasPassword !== true) return null // CUENTAS SIN CONTRASEÑA (SOLO GOOGLE) NO VEN ESTA OPCION

  return (
    <div className="flex flex-col gap-3">
      {successMessage && <StatusBanner variant="success">{successMessage}</StatusBanner>}

      {!isOpen ? (
        <Button
          variant="ghost"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center justify-center gap-2"
        >
          <Lock className="h-4 w-4" aria-hidden="true" />
          Cambiar contraseña
        </Button>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 animate-fade-in" noValidate>
          <div>
            <label htmlFor="cp-current" className="text-sm font-bold text-text-primary font-display">
              Contraseña actual
            </label>
            <input
              id="cp-current"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              disabled={isSubmitting}
              className={INPUT_CLASSES}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="cp-new" className="text-sm font-bold text-text-primary font-display">
              Nueva contraseña
            </label>
            <input
              id="cp-new"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              disabled={isSubmitting}
              className={INPUT_CLASSES}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="cp-confirm" className="text-sm font-bold text-text-primary font-display">
              Repetir nueva contraseña
            </label>
            <input
              id="cp-confirm"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              disabled={isSubmitting}
              className={INPUT_CLASSES}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {formError && <StatusBanner variant="error">{formError}</StatusBanner>}

          <Button type="submit" disabled={isSubmitting} className="flex items-center justify-center gap-2">
            {isSubmitting ? <LoadingDots /> : 'Guardar contraseña'}
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

export default ChangePasswordForm