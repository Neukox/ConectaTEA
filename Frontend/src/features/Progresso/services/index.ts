import { api } from '~/api/apiClient'
import {
  distribuicaoData,
  evolucaoData,
  progressoCriancaData,
  statsCards,
  atualizacoesRecentes,
} from '../data/mockData'

export async function getProgressoResumo() {
  const response = await api.get('/progresso/resumo')
  return response.data
}

// Mock service to get evolução por categoria
export async function getEvolucaoPorCategoria() {
  const response = await api.get('/progresso/evolucao-categoria')
  return response.data
}

// Mock service to get distribuição por categoria
export async function getDistribuicaoPorCategoria() {
  const response = await api.get('/progresso/distribuicao-categoria')
  return response.data
}

// Mock service to get progresso por criança
export async function getProgressoPorCrianca() {
  const response = await api.get('/progresso/crianca')
  return response.data
}

// Mock service to get atualizações recentes
export async function getAtualizacoesRecentes() {
  const response = await api.get('/progresso/recentes')
  return response.data
}
