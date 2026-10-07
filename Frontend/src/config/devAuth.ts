import type { AuthUser, UserRole } from '../api/authApi'

const ALLOWED_DEV_ROLES: readonly UserRole[] = ['PROFISSIONAL', 'RESPONSAVEL']

const isAllowedRole = (role: string | undefined): role is UserRole =>
  ALLOWED_DEV_ROLES.some((allowedRole) => allowedRole === role)

export const isDevAuthBypassEnabled = (): boolean =>
  import.meta.env.DEV &&
  import.meta.env.VITE_DEV_BYPASS_AUTH === 'true' &&
  isAllowedRole(import.meta.env.VITE_DEV_USER_ROLE)

export const getDevUserRole = (): UserRole | null => {
  const role = import.meta.env.VITE_DEV_USER_ROLE
  return isAllowedRole(role) ? role : null
}

export const getDevAuthUser = (): AuthUser | null => {
  if (!isDevAuthBypassEnabled()) return null

  const role = getDevUserRole()
  if (!role) return null

  return {
    id: -1,
    name: 'Usuário de Desenvolvimento',
    email: 'dev@local.test',
    tipo: role,
  }
}
