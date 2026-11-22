import { useCallback, useState, type SubmitEvent, type ReactNode } from 'react'
import { Navigate, useNavigate, type NavigateFunction } from 'react-router-dom'
import { FcGoogle } from 'react-icons/fc'
import { Lock, Eye, EyeOff, ArrowRight, UserPlus, Link2 } from 'lucide-react'
import { z } from 'zod/v4'
import Button from '../../shared/ui/Button'
import StatusBanner from '../../shared/styles/StatusBanner'
import LoadingDots from '../../shared/styles/LoadingDots'
import { useAuth } from '../../core/context/AuthContext'
import { AccountLinkRequiredError, resendVerificationEmail, sendPasswordReset } from '../../core/services/auth.service'
import { EmailNotVerifiedError } from '../../core/types/EmailNotVerifiedError';
import { MailCheck, KeyRound } from 'lucide-react'

const EMAIL_SCHEMA: z.ZodEmail = z.email('Ingresá un correo válido')
const PASSWORD_SCHEMA: z.ZodString = z.string().min(8, 'La contraseña debe tener al menos 8 caracteres')

type TAuthMode = 'login' | 'signup'

const LoginPage = (): ReactNode => {
  const { user, signInEmail, signUpEmail, signInGoogle, pendingGoogleEmail, completeGoogleLink, cancelGoogleLink } = useAuth()
  const [mode, setMode] = useState<TAuthMode>('login')
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [emailError, setEmailError] = useState<string>('')
  const [passwordError, setPasswordError] = useState<string>('')
  const [bannerError, setBannerError] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [linkPassword, setLinkPassword] = useState<string>('')
  const [linkError, setLinkError] = useState<string>('')
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null)
  const [resendMessage, setResendMessage] = useState<string>('')
  const [resendError, setResendError] = useState<string>('')
  const [isResetting, setIsResetting] = useState<boolean>(false)
  const [resetEmail, setResetEmail] = useState<string>('')
  const [resetEmailError, setResetEmailError] = useState<string>('')
  const [resetMessage, setResetMessage] = useState<string>('')
  const [resetError, setResetError] = useState<string>('')

  const navigate: NavigateFunction = useNavigate()

  // CAMBIO ENTRE LOS MODOS LOGIN Y REGISTRO Y LIMPIO LOS ESTADOS PREVIOS
  const handleSelectMode = useCallback((nextMode: TAuthMode): void => {
    if (mode === nextMode) return
    setMode(nextMode)
    setEmailError('')
    setPasswordError('')
    setBannerError('')
    setPassword('')
  }, [mode])

  const flowLabel: string = isResetting
    ? 'Recuperación de contraseña'
    : pendingVerificationEmail
      ? 'Verificación de correo'
      : pendingGoogleEmail
        ? 'Vinculación de cuenta'
        : mode === 'login'
          ? 'Ingreso'
          : 'Creación de cuenta'

  // VALIDO LOS CAMPOS DEL FORMULARIO ANTES DE ENVIAR A FIREBASE
  const validateFields = useCallback((): boolean => {
    const emailResult = EMAIL_SCHEMA.safeParse(email)
    const passwordResult = PASSWORD_SCHEMA.safeParse(password)
    setEmailError(emailResult.success ? '' : emailResult.error.issues[0]?.message ?? 'Credenciales incorrectas')
    setPasswordError(passwordResult.success ? '' : passwordResult.error.issues[0]?.message ?? 'Credenciales incorrectas')
    return emailResult.success && passwordResult.success
  }, [email, password])

  // ENVIO EL FORMULARIO SEGUN EL MODO ACTIVO (LOGIN O REGISTRO)
  const handleSubmit = useCallback(async (event: SubmitEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    setBannerError('')
    if (!validateFields()) return // NO CONTINUO SI HAY ERRORES DE VALIDACION

    setIsSubmitting(true) // ACTIVO EL ESTADO DE CARGA
    try {
      if (mode === 'login') {
        await signInEmail(email, password) // INICIO SESION CON CORREO Y CLAVE
      } else {
        await signUpEmail(email, password) // REGISTRO UNA CUENTA NUEVA
      }
      navigate('/panel') // REDIRIJO AL PANEL TRAS AUTENTICAR
    } catch (error) {
      if (error instanceof EmailNotVerifiedError) {
        setPendingVerificationEmail(error.email) // MUESTRO LA PANTALLA "REVISA TU CORREO"
        return
      }
      setBannerError(error instanceof Error ? error.message : 'Ocurrió un error inesperado. Intentá de nuevo.')
    } finally {
      setIsSubmitting(false) // DESACTIVO EL ESTADO DE CARGA
    }
  }, [mode, email, password, validateFields, navigate, signInEmail, signUpEmail])

  // AUTENTICO CON LA CUENTA DE GOOGLE MEDIANTE POPUP
  const handleGoogleSignIn = useCallback(async (): Promise<void> => {
    setBannerError('')
    setIsSubmitting(true) // ACTIVO EL ESTADO DE CARGA
    try {
      await signInGoogle() // INICIO SESION CON GOOGLE
      navigate('/panel') // REDIRIJO AL PANEL TRAS AUTENTICAR
    } catch (error) {
      if (error instanceof AccountLinkRequiredError) {
        setBannerError('') // EL AVISO DE VINCULACION SE MUESTRA EN SU PROPIO FORMULARIO
        return
      }
      setBannerError(error instanceof Error ? error.message : 'Ocurrió un error inesperado. Intentá de nuevo.')
    } finally {
      setIsSubmitting(false) // DESACTIVO EL ESTADO DE CARGA
    }
  }, [navigate, signInGoogle])

  // VINCULO LA CUENTA DE GOOGLE CON LA CUENTA MANUAL USANDO LA CONTRASEÑA
  const handleCompleteLink = useCallback(async (event: SubmitEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    setLinkError('')
    if (linkPassword.length < 8) {
      setLinkError('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    setIsSubmitting(true) // ACTIVO EL ESTADO DE CARGA
    try {
      await completeGoogleLink(linkPassword) // VINCULO GOOGLE AL UID ORIGINAL
      setLinkPassword('')
      navigate('/panel') // REDIRIJO AL PANEL TRAS VINCULAR
    } catch (error) {
      setLinkError(error instanceof Error ? error.message : 'No se pudo vincular la cuenta. Intentá de nuevo.')
    } finally {
      setIsSubmitting(false) // DESACTIVO EL ESTADO DE CARGA
    }
  }, [linkPassword, completeGoogleLink, navigate])

  // CANCELO LA VINCULACION PENDIENTE Y VUELVO AL LOGIN NORMAL
  const handleCancelLink = useCallback((): void => {
    cancelGoogleLink()
    setLinkPassword('')
    setLinkError('')
    setBannerError('')
  }, [cancelGoogleLink])


  // REENVIO EL CORREO DE VERIFICACION
  const handleResend = useCallback(async (): Promise<void> => {
    setResendMessage('')
    setResendError('')
    if (!pendingVerificationEmail) return
    setIsSubmitting(true)
    try {
      await resendVerificationEmail(pendingVerificationEmail, password)
      setResendMessage('Te reenviamos el correo. Revisá también la carpeta de spam.')
    } catch (error) {
      setResendError(error instanceof Error ? error.message : 'No se pudo reenviar. Intentá de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }, [pendingVerificationEmail, password])

  // VUELVO AL LOGIN NORMAL
  const handleBackToLogin = useCallback((): void => {
    setPendingVerificationEmail(null)
    setPassword('') // NO DEJO LA CONTRASEÑA EN MEMORIA
    setResendMessage('')
    setResendError('')
    setMode('login')
  }, [])


  // ABRO LA PANTALLA DE RECUPERACION REUTILIZANDO EL CORREO YA ESCRITO
  const handleOpenReset = useCallback((): void => {
    setResetEmail(email)
    setResetEmailError('')
    setResetMessage('')
    setResetError('')
    setBannerError('')
    setIsResetting(true)
  }, [email])

  // ENVIO EL ENLACE DE RECUPERACION
  const handleSendReset = useCallback(async (event: SubmitEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    setResetMessage('')
    setResetError('')
    const emailResult = EMAIL_SCHEMA.safeParse(resetEmail)
    if (!emailResult.success) {
      setResetEmailError(emailResult.error.issues[0]?.message ?? 'Correo inválido')
      return
    }
    setResetEmailError('')

    setIsSubmitting(true)
    try {
      await sendPasswordReset(resetEmail)
      setResetMessage('Si el correo está registrado, te enviamos un enlace para restablecer la contraseña.')
    } catch (error) {
      setResetError(error instanceof Error ? error.message : 'No se pudo enviar el correo. Intentá de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }, [resetEmail])

  // VUELVO AL LOGIN NORMAL
  const handleCloseReset = useCallback((): void => {
    setIsResetting(false)
    setResetEmail('')
    setResetEmailError('')
    setResetMessage('')
    setResetError('')
  }, [])


  // SI YA HAY SESION ACTIVA NO MUESTRO EL LOGIN Y REDIRIJO AL PANEL
  if (user) {
    return <Navigate to="/panel" replace />
  }

  return (
    <div className="min-h-dvh bg-bg-deep flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="card-glass card-accent-top rounded-2xl p-6 md:p-8">
          <div className="flex flex-col items-center text-center gap-3 mb-6">
            <img src="/logo.png" alt="LiquidChofer" className="h-16 w-16 rounded-2xl shadow-glow-violet" />
            <p className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-accent-violet">
              {flowLabel}
            </p>
            <h1 className="text-2xl md:text-3xl font-black text-text-primary font-display tracking-tight">
              {isResetting
                ? 'Restablecé tu contraseña'
                : pendingVerificationEmail
                  ? 'Revisá tu correo'
                  : pendingGoogleEmail
                    ? 'Vinculá tu cuenta'
                    : mode === 'login'
                      ? 'Bienvenido de nuevo'
                      : 'Creá tu cuenta'}
            </h1>
            <p className="text-sm text-text-muted font-display">
              {isResetting
                ? 'Te enviaremos un enlace para elegir una contraseña nueva.'
                : pendingVerificationEmail
                  ? 'Necesitamos que confirmes tu correo para continuar.'
                  : pendingGoogleEmail
                    ? 'Ingresá tu contraseña para usar Google también.'
                    : mode === 'login'
                      ? 'Ingresá para acceder a tu cuenta.'
                      : 'Registrate para comenzar a calcular tu jornada.'}
            </p>
          </div>

          {bannerError && (
            <div className="mb-4 animate-fade-in">
              <StatusBanner variant="error">
                {bannerError}
              </StatusBanner>
            </div>
          )}

          {!pendingGoogleEmail && !pendingVerificationEmail && !isResetting && (
            <div role="group" aria-label="Tipo de acceso" className="mb-6 grid grid-cols-2 gap-1.5 rounded-xl border border-border-subtle bg-bg-input/60 p-1.5">
              <button
                type="button"
                onClick={() => handleSelectMode('login')}
                disabled={isSubmitting}
                aria-pressed={mode === 'login'}
                className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 font-display text-sm font-bold transition-colors cursor-pointer disabled:opacity-50 ${mode === 'login' ? 'bg-accent-violet/15 text-accent-violet' : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'}`}
              >
                <Lock className="h-4 w-4" aria-hidden="true" />
                Ingresar
              </button>
              <button
                type="button"
                onClick={() => handleSelectMode('signup')}
                disabled={isSubmitting}
                aria-pressed={mode === 'signup'}
                className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 font-display text-sm font-bold transition-colors cursor-pointer disabled:opacity-50 ${mode === 'signup' ? 'bg-accent-violet/15 text-accent-violet' : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'}`}
              >
                <UserPlus className="h-4 w-4" aria-hidden="true" />
                Crear cuenta
              </button>
            </div>
          )}

          {pendingGoogleEmail && (
            <section aria-label="Vincular cuenta de Google" className="rounded-xl border border-accent-violet/20 bg-bg-input/40 p-4 animate-fade-in">
            <form onSubmit={handleCompleteLink} className="flex flex-col gap-4" noValidate>
              <div className="rounded-xl border border-accent-violet/30 bg-accent-violet/10 px-4 py-3 text-sm leading-relaxed text-text-secondary font-display">
                Ya existe una cuenta con{' '}
                <strong className="text-text-primary">{pendingGoogleEmail}</strong>. Ingresá tu contraseña para
                usar Google también y conservar tus datos.
              </div>

              <div>
                <label htmlFor="link-password" className="text-base font-bold text-text-primary font-display tracking-wide">
                  Contraseña de tu cuenta
                </label>
                <input
                  id="link-password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={linkPassword}
                  disabled={isSubmitting}
                  aria-invalid={linkError ? 'true' : undefined}
                  aria-describedby={linkError ? 'link-password-error' : undefined}
                  className={`w-full rounded-xl input-glass px-4 py-3.5 text-lg font-semibold text-text-primary placeholder:text-text-muted/70 font-display tracking-wide ${linkError ? 'input-error' : ''} disabled:opacity-60 disabled:cursor-not-allowed`}
                  onChange={(e) => setLinkPassword(e.target.value)}
                />
                {linkError && (
                  <span id="link-password-error" role="alert" className="text-sm font-medium text-accent-red font-display">
                    {linkError}
                  </span>
                )}
              </div>

              <Button type="submit" disabled={isSubmitting} className="flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <LoadingDots />
                ) : (
                  <>
                    <Link2 className="h-5 w-5" aria-hidden="true" />
                    Vincular con Google
                  </>
                )}
              </Button>

              <button
                type="button"
                onClick={handleCancelLink}
                disabled={isSubmitting}
                className="mx-auto text-sm font-medium text-text-secondary hover:text-accent-violet transition-colors cursor-pointer font-display disabled:opacity-50"
              >
                Cancelar
              </button>
            </form>
            </section>
          )}

          {pendingVerificationEmail && (
            <section aria-label="Verificación de correo" className="rounded-xl border border-accent-violet/20 bg-bg-input/40 p-4 animate-fade-in">
            <div className="flex flex-col gap-4">
              <div className="rounded-xl border border-accent-violet/30 bg-accent-violet/10 px-4 py-3 text-sm leading-relaxed text-text-secondary font-display">
                <MailCheck className="h-5 w-5 mb-2" aria-hidden="true" />
                Enviamos un enlace de verificación a{' '}
                <strong className="text-text-primary">{pendingVerificationEmail}</strong>.
                Hacé clic en el enlace y luego ingresá.
              </div>

              {resendMessage && <StatusBanner variant="success">{resendMessage}</StatusBanner>}
              {resendError && <StatusBanner variant="error">{resendError}</StatusBanner>}

              <Button type="button" variant="ghost" disabled={isSubmitting} onClick={handleResend}>
                {isSubmitting ? <LoadingDots /> : 'Reenviar email'}
              </Button>

              <Button type="button" disabled={isSubmitting} onClick={handleBackToLogin}>
                Ya verifiqué, ingresar
              </Button>
            </div>
            </section>
          )}

          {isResetting && (
            <section aria-label="Recuperación de contraseña" className="rounded-xl border border-accent-violet/20 bg-bg-input/40 p-4 animate-fade-in">
            <form onSubmit={handleSendReset} className="flex flex-col gap-4" noValidate>
              <div>
                <label htmlFor="reset-email" className="text-base font-bold text-text-primary font-display tracking-wide">
                  Correo electrónico
                </label>
                <input
                  id="reset-email"
                  type="email"
                  inputMode="email"
                  autoComplete="username"
                  spellCheck={false}
                  placeholder="tucorreo@ejemplo.com"
                  value={resetEmail}
                  disabled={isSubmitting}
                  aria-invalid={resetEmailError ? 'true' : undefined}
                  aria-describedby={resetEmailError ? 'reset-email-error' : undefined}
                  className={`w-full rounded-xl input-glass px-4 py-3.5 text-lg font-semibold text-text-primary placeholder:text-text-muted/70 font-display tracking-wide ${resetEmailError ? 'input-error' : ''} disabled:opacity-60 disabled:cursor-not-allowed`}
                  onChange={(e) => setResetEmail(e.target.value)}
                />
                {resetEmailError && (
                  <span id="reset-email-error" role="alert" className="text-sm font-medium text-accent-red font-display">
                    {resetEmailError}
                  </span>
                )}
              </div>

              {resetMessage && <StatusBanner variant="success">{resetMessage}</StatusBanner>}
              {resetError && <StatusBanner variant="error">{resetError}</StatusBanner>}

              <Button type="submit" disabled={isSubmitting} className="flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <LoadingDots />
                ) : (
                  <>
                    <KeyRound className="h-5 w-5" aria-hidden="true" />
                    Enviar enlace
                  </>
                )}
              </Button>

              <button
                type="button"
                onClick={handleCloseReset}
                disabled={isSubmitting}
                className="mx-auto text-sm font-medium text-text-secondary hover:text-accent-violet transition-colors cursor-pointer font-display disabled:opacity-50"
              >
                Volver al ingreso
              </button>
            </form>
            </section>
          )}


          {!pendingGoogleEmail && !pendingVerificationEmail && !isResetting && (
            <>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                <div className="stagger-1">
                  <label htmlFor="login-email" className="text-base font-bold text-text-primary font-display tracking-wide">
                    Correo electrónico
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    inputMode="email"
                    autoComplete="username"
                    spellCheck={false}
                    placeholder="tucorreo@ejemplo.com"
                    value={email}
                    disabled={isSubmitting}
                    aria-invalid={emailError ? 'true' : undefined}
                    aria-describedby={emailError ? 'login-email-error' : undefined}
                    className={`w-full rounded-xl input-glass px-4 py-3.5 text-lg font-semibold text-text-primary placeholder:text-text-muted/70 font-display tracking-wide ${emailError ? 'input-error' : ''} disabled:opacity-60 disabled:cursor-not-allowed`}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {emailError && (
                    <span id="login-email-error" role="alert" className="text-sm font-medium text-accent-red font-display">
                      {emailError}
                    </span>
                  )}
                </div>

                <div className="stagger-2">
                  <label htmlFor="login-password" className="text-base font-bold text-text-primary font-display tracking-wide">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      placeholder="••••••••"
                      value={password}
                      disabled={isSubmitting}
                      aria-invalid={passwordError ? 'true' : undefined}
                      aria-describedby={passwordError ? 'login-password-error' : undefined}
                      className={`w-full rounded-xl input-glass px-4 py-3.5 text-lg font-semibold text-text-primary placeholder:text-text-muted/70 font-display tracking-wide pr-12 ${passwordError ? 'input-error' : ''} disabled:opacity-60 disabled:cursor-not-allowed`}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      disabled={isSubmitting}
                      className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center h-9 w-9 rounded-lg text-text-muted hover:text-accent-violet transition-colors cursor-pointer disabled:opacity-50"
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
                    </button>
                  </div>
                  {passwordError && (
                    <span id="login-password-error" role="alert" className="text-sm font-medium text-accent-red font-display">
                      {passwordError}
                    </span>
                  )}
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={handleOpenReset}
                      disabled={isSubmitting}
                      className="mt-3 block w-full border-t border-border-subtle pt-3 text-left text-sm font-medium text-text-secondary transition-colors cursor-pointer hover:text-accent-violet font-display disabled:opacity-50"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  )}
                </div>

                <div className="stagger-3">
                  <Button type="submit" disabled={isSubmitting} className='flex items-center justify-center gap-2'>
                    {isSubmitting ? (
                      <LoadingDots />
                    ) : (
                      <>
                        {mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
                        <ArrowRight className="h-5 w-5" aria-hidden="true" />
                      </>
                    )}
                  </Button>
                </div>
              </form>

              <div className="flex items-center gap-3 my-5 stagger-3">
                <div className="subtle-divider flex-1" />
                <span className="text-xs text-text-muted uppercase tracking-wider font-display">o</span>
                <div className="subtle-divider flex-1" />
              </div>

              <div className="stagger-4">
                <Button
                  type="button"
                  className='flex items-center justify-center gap-2'
                  variant="ghost"
                  disabled={isSubmitting}
                  onClick={handleGoogleSignIn}
                >
                  {isSubmitting ? (
                    <LoadingDots />
                  ) : (
                    <>
                      <FcGoogle className="h-5 w-5" aria-hidden="true" />
                      Continuar con Google
                    </>
                  )}
                </Button>
              </div>

            </>
          )}
        </div>

        <p className="text-center mt-6 text-xs text-text-muted font-display">
          Al continuar aceptás los{' '}
          <a href="/terminos" className="text-accent-violet hover:underline">Términos</a> y la{' '}
          <a href="/privacidad" className="text-accent-violet hover:underline">Política de Privacidad</a>.
        </p>
      </div>
    </div>
  )
}

export default LoginPage
