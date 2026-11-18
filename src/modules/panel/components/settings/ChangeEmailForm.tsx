import { useCallback, useState, type ReactNode, type SubmitEvent } from 'react'
import { Mail } from 'lucide-react'
import { z } from 'zod/v4'
import StatusBanner from '../../../../shared/styles/StatusBanner'
import Button from '../../../../shared/ui/Button'
import LoadingDots from '../../../../shared/styles/LoadingDots'
import { requestEmailChange } from '../../../../core/services/auth.service'
import { useAuth } from '../../../../core/context/AuthContext'

const EMAIL_SCHEMA: z.ZodEmail = z.email('Ingresá un correo válido')

const INPUT_CLASSES: string =
    'w-full rounded-xl input-glass px-4 py-3.5 text-base font-semibold text-text-primary placeholder:text-text-muted/70 font-display tracking-wide disabled:opacity-60 disabled:cursor-not-allowed'

const ChangeEmailForm = (): ReactNode => {
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [newEmail, setNewEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [emailError, setEmailError] = useState<string>('')
    const [formError, setFormError] = useState<string>('')
    const [successMessage, setSuccessMessage] = useState<string>('')
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

    // DE AUTH CONTEXT
    const { user } = useAuth()
    const canChange: boolean = user?.hasPassword === true

    const handleClose = useCallback((): void => {
        setIsOpen(false)
        setNewEmail('')
        setPassword('') // NO DEJO LA CONTRASEÑA EN MEMORIA
        setEmailError('')
        setFormError('')
    }, [])

    const handleSubmit = useCallback(async (event: SubmitEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault()
        setFormError('')
        setSuccessMessage('')

        const emailResult = EMAIL_SCHEMA.safeParse(newEmail)
        if (!emailResult.success) {
            setEmailError(emailResult.error.issues[0]?.message ?? 'Correo inválido')
            return
        }
        setEmailError('')
        if (!password) {
            setFormError('Ingresá tu contraseña actual.')
            return
        }

        setIsSubmitting(true)
        try {
            if (!user?.email) {
                setFormError('No pudimos obtener tu correo. Recargá la página.')
                return
            }
            await requestEmailChange(user?.email, password, newEmail)
            setSuccessMessage(`Si ${newEmail.trim()} está disponible, te enviamos un enlace. Revisá también el spam.`)
            handleClose()
        } catch (error) {
            setFormError(error instanceof Error ? error.message : 'No se pudo solicitar el cambio. Intentá de nuevo.')
        } finally {
            setIsSubmitting(false)
        }
    }, [newEmail, password, user, handleClose])

    if (!canChange) return null // CUENTAS SIN CONTRASEÑA (SOLO GOOGLE) NO VEN ESTA OPCION

    return (
        <div className="flex flex-col gap-3">
            {successMessage && <StatusBanner variant="success">{successMessage}</StatusBanner>}

            {!isOpen ? (
                <Button
                    variant="ghost"
                    onClick={() => setIsOpen(true)}
                    className="inline-flex items-center justify-center gap-2"
                >
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    Cambiar correo
                </Button>
            ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-3 animate-fade-in" noValidate>
                    <div>
                        <label htmlFor="new-email" className="text-sm font-bold text-text-primary font-display">
                            Nuevo correo
                        </label>
                        <input
                            id="new-email"
                            type="email"
                            inputMode="email"
                            autoComplete="email"
                            value={newEmail}
                            disabled={isSubmitting}
                            aria-invalid={emailError ? 'true' : undefined}
                            className={`${INPUT_CLASSES} ${emailError ? 'input-error' : ''}`}
                            onChange={(e) => setNewEmail(e.target.value)}
                        />
                        {emailError && (
                            <span role="alert" className="text-sm font-medium text-accent-red font-display">
                                {emailError}
                            </span>
                        )}
                    </div>

                    <div>
                        <label htmlFor="current-password" className="text-sm font-bold text-text-primary font-display">
                            Contraseña actual
                        </label>
                        <input
                            id="current-password"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            disabled={isSubmitting}
                            className={INPUT_CLASSES}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {formError && <StatusBanner variant="error">{formError}</StatusBanner>}

                    <Button type="submit" disabled={isSubmitting} className="flex items-center justify-center gap-2">
                        {isSubmitting ? <LoadingDots /> : 'Enviar enlace de confirmación'}
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

export default ChangeEmailForm