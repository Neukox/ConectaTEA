import { api } from '../apiClient'
import type { AuthUser } from '../authApi'

export interface AtualizarUsuarioRequest {
  name: string
  telefone?: string | null
  endereco?: string | null
}

export async function obterMeuUsuario(): Promise<AuthUser> {
  const { data } = await api.get<AuthUser>('/users/me')
  return data
}

export async function atualizarMeuUsuario(
  request: AtualizarUsuarioRequest,
): Promise<AuthUser> {
  const { data } = await api.put<AuthUser>('/users/me', request)
  return data
}

export async function desativarMeuUsuario(): Promise<void> {
  await api.delete('/users/me')
}
