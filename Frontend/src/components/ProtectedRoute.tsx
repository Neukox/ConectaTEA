import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

type ProtectedRouteProps = {
  children: ReactNode
  allowedRoles: string[]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  if (isLoading) return <div className='flex min-h-screen items-center justify-center'>Verificando permissões...</div>
  if (!user) return <Navigate to='/login' replace />
  if (!allowedRoles.includes(user.tipo)) return <Navigate to='/dashboard' replace />
  return <>{children}</>
}
