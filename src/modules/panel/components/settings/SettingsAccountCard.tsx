import { useCallback, type ReactNode } from 'react'
import { Link, useNavigate, type NavigateFunction } from 'react-router-dom'
import { LogOut, Shield } from 'lucide-react'
import { useAuth } from '../../../../core/context/AuthContext'
import Button from '../../../../shared/ui/Button'
import SettingsCard from './SettingsCard'
import ChangeEmailForm from './ChangeEmailForm'
import ChangePasswordForm from './ChangePasswordForm'
import DeleteAccountForm from './DeleteAccountForm'

const SettingsAccountCard = (): ReactNode => {
  const { user, signOut } = useAuth()
  const navigate: NavigateFunction = useNavigate()

  const handleSignOut = useCallback((): void => {
    void signOut()
    navigate('/')
  }, [signOut, navigate])

  return (
    <SettingsCard
      icon={Shield}
      title="Cuenta y seguridad"
      description="Administrá el acceso a tu cuenta."
      tone="red"
    >
      <div className="flex max-w-2xl flex-col gap-3">
        <div className="rounded-xl border border-border-subtle bg-bg-input/60 p-3">
          <p className="text-xs text-text-muted">Sesión iniciada como</p>
          <p className="truncate text-sm font-bold text-text-primary">
            {user?.email ?? 'Usuario'}
          </p>
        </div>
        <ChangeEmailForm />
        <ChangePasswordForm />
        <Button
          variant="danger"
          onClick={handleSignOut}
          className="inline-flex items-center justify-center gap-2"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Cerrar sesión
        </Button>

        <DeleteAccountForm />

        <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-border-subtle pt-3 text-xs">
          <Link
            to="/privacidad"
            className="text-text-secondary transition-colors hover:text-accent-violet"
          >
            Política de privacidad
          </Link>
          <Link
            to="/terminos"
            className="text-text-secondary transition-colors hover:text-accent-violet"
          >
            Términos y condiciones
          </Link>
        </div>
      </div>
    </SettingsCard>
  )
}

export default SettingsAccountCard
