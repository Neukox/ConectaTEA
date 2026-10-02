import { api } from '../apiClient'

export interface Profissional {
  id: number
  usuarioId: number
  name: string
  especialidade?: string | null
  registroProfissional?: string | null
  titulo?: string | null
  formacaoAcademica?: string | null
  sobre?: string | null
  fotoPerfilUrl?: string | null
  codigoIdentificacao?: string | null
}

export type AtualizarProfissionalRequest = Pick<
  Profissional,
  | 'especialidade'
  | 'registroProfissional'
  | 'titulo'
  | 'formacaoAcademica'
  | 'sobre'
  | 'fotoPerfilUrl'
>

export async function listarProfissionais(params?: {
  search?: string
}): Promise<Profissional[]> {
  const { data } = await api.get<Profissional[]>('/profissionais', { params })
  return data
}

export async function obterProfissionalPorId(id: number): Promise<Profissional> {
  const { data } = await api.get<Profissional>(`/profissionais/${id}`)
  return data
}

export async function obterMeuPerfilProfissional(): Promise<Profissional> {
  const { data } = await api.get<Profissional>('/profissionais/me')
  return data
}

export async function atualizarMeuPerfilProfissional(
  payload: AtualizarProfissionalRequest,
): Promise<Profissional> {
  const { data } = await api.put<Profissional>('/profissionais/me', payload)
  return data
}
