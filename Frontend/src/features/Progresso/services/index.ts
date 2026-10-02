import { api } from '~/api/apiClient'
import type {
  DistribuicaoPorCategoriaData,
  ProgressoCriancaData,
  ProgressoFilters,
  ProgressoRecente,
  ProgressoStats,
} from '../types'

export async function getProgressoResumo(filtros?: ProgressoFilters) {
  const response = await api.get<ProgressoStats>('/progresso/resumo', {
    params: { criancaId: filtros?.criancaId },
  })
  return response.data
}

export async function getEvolucaoPorCategoria(filtros?: ProgressoFilters) {
  const response = await api.get<DistribuicaoPorCategoriaData>('/progresso/evolucao-categoria', {
    params: filtros,
  })

  return response.data
}

export async function getDistribuicaoPorCategoria(filtros?: ProgressoFilters) {
  const response = await api.get<DistribuicaoPorCategoriaData>('/progresso/distribuicao-categoria', {
    params: filtros,
  })

  return response.data
}

export async function getProgressoPorCrianca(filtros?: ProgressoFilters) {
  const response = await api.get<ProgressoCriancaData[]>('/progresso/crianca', {
    params: filtros,
  })

  return response.data
}

export async function getAtualizacoesRecentes(filtros?: ProgressoFilters) {
  const response = await api.get<ProgressoRecente[]>('/progresso/recentes', {
    params: filtros,
  })
  return response.data
}
