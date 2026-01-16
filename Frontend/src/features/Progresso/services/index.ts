import { evolucaoData, statsCards } from '../data/mockData'

// Mock service to get progresso resumo
export async function getProgressoResumo() {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return Promise.resolve(statsCards)
}

// Mock service to get evolução por categoria
export async function getEvolucaoPorCategoria() {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return Promise.resolve(evolucaoData)
}
