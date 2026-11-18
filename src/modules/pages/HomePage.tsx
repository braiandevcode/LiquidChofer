import { useCallback, type ReactNode } from 'react'
import { useNavigate, type NavigateFunction } from 'react-router-dom'
import { useAuth } from '../../core/context/AuthContext'
import LandingPage from './LandingPage'

const HomePage = (): ReactNode => {
  const { user } = useAuth()
  const navigate: NavigateFunction = useNavigate()

  // EMPIEZO LA CALCULADORA: CON CUENTA VOY AL PANEL, SIN CUENTA AL LOGIN
  const handleStart = useCallback((): void => {
    navigate(user ? '/panel' : '/login')
  }, [user, navigate])

  return <LandingPage onStart={handleStart} hasAccount={Boolean(user)} />
}

export default HomePage