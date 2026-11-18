import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../core/context/AuthContext'
import LoadingDots from '../../shared/styles/LoadingDots'

// EL QR DEL RECIBO DEBE ABRIRSE INCLUSO SI QUIEN LO ESCANEA ESTÁ AUTENTICADO
const VERIFICATION_PATH: RegExp = /^\/verificar(?:\/[^/]*)?\/?$/

interface IPublicOnlyRouteProps {
  children: ReactNode
}

const PublicOnlyRoute = ({ children }: IPublicOnlyRouteProps): ReactNode => {
  const { user, authReady } = useAuth()
  const { pathname } = useLocation()

  if (!authReady) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg-deep">
        <LoadingDots />
      </div>
    )
  }

  if (user && !VERIFICATION_PATH.test(pathname)) {
    return <Navigate to="/panel" replace />
  }

  return children
}

export default PublicOnlyRoute
