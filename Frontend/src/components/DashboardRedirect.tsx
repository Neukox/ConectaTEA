import { Navigate } from 'react-router-dom'
import { getDefaultRoute } from '../config/routes'
import { useAuth } from '../hooks/useAuth'

export default function DashboardRedirect() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <div className='flex min-h-screen items-center justify-center'>Carregando...</div>
  }

  return <Navigate to={user ? getDefaultRoute(user.tipo) : '/login'} replace />
}
