import { api } from '~/api/apiClient'
import type {
  SessoesSummary,
  SessaoToEdit,
  SessoesFilters,
  Sessao,
} from '../types'

export interface CreateSessaoRequest {
  descricao?: string
  tipo: Sessao['tipo']
  criancaId: number
  dataHora: string
  duracao: number
  observacoes?: string
}

export async function getSessoesSummary(): Promise<SessoesSummary> {
  const response = await api.get<SessoesSummary>('/sessoes/resumo')
  return response.data
}

export async function createSessao(data: CreateSessaoRequest): Promise<Sessao> {
  const response = await api.post<Sessao>('/sessoes', data)
  return response.data
}

export async function getSessoes(filters: SessoesFilters) {
  const response = await api.get<Sessao[]>('/sessoes', { params: filters })
  return response.data
}

export interface UpdateSessaoRequest {
  descricao?: string
  tipo: Sessao['tipo']
  dataHora: string
  duracao?: number
  observacoes?: string | null
} 

export async function updateSessao(id: number, data: UpdateSessaoRequest): Promise<Sessao> {
  const response = await api.put<Sessao>(`/sessoes/${id}`, data)
  return response.data
}

export async function updateSessaoStatus(
  id: number,
  status: Sessao['status'],
): Promise<Sessao> {
  const response = await api.patch<Sessao>(`/sessoes/${id}/status`, { status })
  return response.data
}

export async function deleteSessao(id: number): Promise<void> {
  await api.delete(`/sessoes/${id}`)
}
