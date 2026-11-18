import { useCallback, useState, type ReactNode, type SubmitEvent } from 'react'
import { Pencil, UserRound } from 'lucide-react'
import { useAuth } from '../../../../core/context/AuthContext'
import UserAvatar from '../../../../shared/components/UserAvatar'
import StatusBanner from '../../../../shared/styles/StatusBanner'
import LoadingDots from '../../../../shared/styles/LoadingDots'
import Button from '../../../../shared/ui/Button'
import SettingsCard from './SettingsCard'

const MIN_LENGTH: number = 2
const MAX_LENGTH: number = 50

const INPUT_CLASSES: string =
  'w-full rounded-xl input-glass px-4 py-3.5 text-base font-semibold text-text-primary placeholder:text-text-muted/70 font-display tracking-wide disabled:opacity-60 disabled:cursor-not-allowed'

const SettingsProfileCard = (): ReactNode => {
  const { user, updateName } = useAuth()
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [name, setName] = useState<string>('')
  const [formError, setFormError] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const handleOpen = useCallback((): void => {
    setName(user?.displayName ?? '') // PRECARGO EL NOMBRE ACTUAL
    setFormError('')
    setSuccessMessage('')
    setIsEditing(true)
  }, [user])

  const handleClose = useCallback((): void => {
    setIsEditing(false)
    setName('')
    setFormError('')
  }, [])

  const handleSubmit = useCallback(async (event: SubmitEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    setFormError('')

    const trimmed: string = name.trim()
    if (trimmed.length < MIN_LENGTH || trimmed.length > MAX_LENGTH) {
      setFormError(`El nombre debe tener entre ${MIN_LENGTH} y ${MAX_LENGTH} caracteres.`)
      return
    }
    if (/[<>]/.test(trimmed)) {
      setFormError('El nombre contiene caracteres no permitidos.')
      return
    }
    if (trimmed === (user?.displayName ?? '')) {
      handleClose() // NO HAY CAMBIOS: NO LLAMO AL BACKEND
      return
    }

    setIsSubmitting(true)
    try {
      await updateName(trimmed)
      handleClose()
      setSuccessMessage('Tu nombre se actualizó correctamente.')
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'No se pudo actualizar el nombre. Intentá de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }, [name, user, updateName, handleClose])

  if (!user) return null

  return (
    <SettingsCard
      icon={UserRound}
      title="Perfil"
      description="Los datos de tu cuenta."
    >
      <div className="flex items-center gap-4 rounded-xl border border-border-subtle bg-bg-input/60 p-4">
        <UserAvatar user={user} size="lg" />
        <div className="min-w-0">
          <p className="truncate font-display text-base font-bold text-text-primary">
            {user.displayName ?? 'Sin nombre'}
          </p>
          <p className="truncate text-sm text-text-secondary">
            {user.email ?? 'Sin correo'}
          </p>
          <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-accent-green/20 bg-accent-green/10 px-2.5 py-1 font-display text-[11px] font-bold text-accent-green">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-green" aria-hidden="true" />
            Sesión activa
          </span>
        </div>
      </div>

      {successMessage && (
        <div className="mt-3">
          <StatusBanner variant="success">{successMessage}</StatusBanner>
        </div>
      )}

      {!isEditing ? (
        <Button
          variant="ghost"
          onClick={handleOpen}
          className="mt-4 inline-flex items-center justify-center gap-2"
        >
          <Pencil className="h-4 w-4" aria-hidden="true" />
          Editar perfil
        </Button>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 animate-fade-in" noValidate>
          <div>
            <label htmlFor="profile-name" className="text-sm font-bold text-text-primary font-display">
              Nombre
            </label>
            <input
              id="profile-name"
              type="text"
              autoComplete="name"
              maxLength={MAX_LENGTH}
              value={name}
              disabled={isSubmitting}
              className={INPUT_CLASSES}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {formError && <StatusBanner variant="error">{formError}</StatusBanner>}

          <Button type="submit" disabled={isSubmitting} className="flex items-center justify-center gap-2">
            {isSubmitting ? <LoadingDots /> : 'Guardar'}
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
    </SettingsCard>
  )
}

export default SettingsProfileCard