import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../core/context/AuthContext'
import LoadingDots from '../../shared/styles/LoadingDots'

interface IProtectedRouteProps {
  children: ReactNode
}

const ProtectedRoute = ({ children }: IProtectedRouteProps): ReactNode => {
  const { user, authReady } = useAuth()

  if (!authReady) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg-deep">
        <LoadingDots />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/ingresar" replace />
  }

  return children
}

export default ProtectedRoute