import { api } from '~/api/apiClient'
import type { ProgressoFilters } from '../types'

export async function getProgressoResumo() {
  const response = await api.get('/progresso/resumo')
  return response.data
}

// Mock service to get evolução por categoria
export async function getEvolucaoPorCategoria(filtros?: ProgressoFilters) {
  const response = await api.get('/progresso/evolucao-categoria', {
    params: filtros,
  })

  return response.data
}

// Mock service to get distribuição por categoria
export async function getDistribuicaoPorCategoria(filtros?: ProgressoFilters) {
  const response = await api.get('/progresso/distribuicao-categoria', {
    params: filtros,
  })

  return response.data
}

// Mock service to get progresso por criança
export async function getProgressoPorCrianca(filtros?: ProgressoFilters) {
  const response = await api.get('/progresso/crianca', {
    params: filtros,
  })

  return response.data
}

// Mock service to get atualizações recentes
export async function getAtualizacoesRecentes() {
  const response = await api.get('/progresso/recentes')
  return response.data
}
