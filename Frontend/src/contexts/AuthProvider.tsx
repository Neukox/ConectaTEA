import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { checkAuth } from '../api/authApi'
import { getDevAuthUser } from '../config/devAuth'
import { AuthContext, type AuthContextType, type User } from './AuthContext'

const DEV_AUTH_USER = getDevAuthUser()

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(DEV_AUTH_USER)
  const [isLoading, setIsLoading] = useState(!DEV_AUTH_USER)

  const refreshAuth = useCallback(async () => {
    if (DEV_AUTH_USER) {
      setUser(DEV_AUTH_USER)
      setIsLoading(false)
      return
    }

    try {
      const userData = await checkAuth()
      setUser(userData)
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshAuth()
  }, [refreshAuth])

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    setUser,
    refreshAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
