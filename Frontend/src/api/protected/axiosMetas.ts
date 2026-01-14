import type { CreateMetaData } from '~/features/Metas/schemas/create-meta.schema'
import type { UpdateMetaData } from '~/features/Metas/schemas/update-meta.schema'

// Mock function to simulate API call
export const cadastrarMeta = async (data: CreateMetaData): Promise<void> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Simulate success
  console.log('Meta cadastrada com sucesso:', data)
  return Promise.resolve()

  // In a real scenario, this would be:
  // return api.post('/metas', data)
}

// Mock function to simulate API call for update
export const atualizarMeta = async (
  id: number,
  data: UpdateMetaData,
): Promise<void> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Simulate success
  console.log('Meta atualizada com sucesso:', id, data)
  return Promise.resolve()
}

// Mock function to update progress
export const atualizarProgresso = async (
  id: number,
  novoProgresso: number,
): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  console.log('Progresso atualizado:', id, novoProgresso)
  return Promise.resolve()
}

export interface MetasFilters {
  categoria?: string
  prioridade?: string
  status?: string
  periodo?: string
  search?: string
}

export const listarMetas = async (filtros?: MetasFilters) => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000))
  // Simulate fetching data
  console.log('Filtros aplicados:', filtros)
  return Promise.resolve([]) // Replace with actual data

  // In production:
  // return api.get('/metas', { params: filtros })
}
