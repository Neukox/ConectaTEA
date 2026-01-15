import { statsCards } from '../data/mockData'

// Mock service to get progresso resumo
export async function getProgressoResumo() {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return Promise.resolve(statsCards)
}
