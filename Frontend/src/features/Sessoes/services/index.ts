import { api } from '~/api/httpClient'
import type {
  SessoesSummary,
  SessaoToEdit,
  SessoesFilters,
  Sessao,
} from '../types'

export interface CreateSessaoRequest {
  descricao: string
  tipoSessao: string
  criancaId: number
  data: Date
  duracao: number
  observacoes?: string
}

// Função para obter o resumo das sessões (Mock)
export async function getSessoesSummary() {
  const response = await api.get<SessoesSummary>('/sessoes/resumo')
  return response.data
}

export async function createSessao(data: CreateSessaoRequest) {
  const response = await api.post('/sessoes', data)
  return response.data
}

export async function getSessoes(filters: SessoesFilters) {
  const response = await api.get<Sessao[]>('/sessoes', { params: filters })
  return response.data
}

export interface UpdateSessaoRequest {
  descricao?: string
  tipoSessao?: string
  data?: Date
  duracao?: number
  observacoes?: string | null
} 

export async function updateSessao(id: number, data: UpdateSessaoRequest) {
  const response = await api.put(`/sessoes/${id}`, data)
  return response.data
}
