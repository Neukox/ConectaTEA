import { sessoesSummary, sessions, nextSessions } from '../mock'
import type { SessoesFilters } from '../types'

export interface CreateSessaoRequest {
  descricao: string
  tipoSessao: string
  criancaId: number
  data: Date
  horario: string
  duracao: number
  observacoes?: string
}

// Função para obter o resumo das sessões (Mock)
export async function getSessoesSummary() {
  await new Promise((resolve) => setTimeout(resolve, 1000)) // Simula atraso de rede
  return Promise.resolve(sessoesSummary)
}

export async function createSessao(data: CreateSessaoRequest) {
  await new Promise((resolve) => setTimeout(resolve, 1000)) // Simula atraso de rede
  return Promise.resolve()
}

export async function getSessoes(filters: SessoesFilters) {
  await new Promise((resolve) => setTimeout(resolve, 1000)) // Simula atraso de rede
  return Promise.resolve(sessions.concat(nextSessions))
}
