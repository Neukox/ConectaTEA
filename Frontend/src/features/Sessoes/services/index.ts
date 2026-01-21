import { sessoesSummary } from '../mock'

// Função para obter o resumo das sessões (Mock)
export async function getSessoesSummary() {
  await new Promise((resolve) => setTimeout(resolve, 1000)) // Simula atraso de rede
  return Promise.resolve(sessoesSummary)
}
