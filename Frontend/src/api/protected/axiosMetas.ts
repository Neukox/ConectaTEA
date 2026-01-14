import type { CreateMetaData } from '~/features/Metas/schemas/create-meta.schema'
import type { UpdateMetaData } from '~/features/Metas/schemas/update-meta.schema'
import { metaDetalhes, metas } from '~/features/mockData'

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
  return Promise.resolve(metas) // Replace with actual data

  // In production:
  // return api.get('/metas', { params: filtros })
}

export const verMeta = async (id: number) => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000))
  // Simulate fetching data
  const meta = metaDetalhes.find((m) => m.id === id)

  if (!meta) {
    return Promise.reject(new Error('Meta not found'))
  }

  return Promise.resolve(meta)

  // In production:
  // return api.get(`/metas/${id}`)
}

export interface ResumoMetas {
  totalMetas: number
  metasEmAndamento: number
  metasVencendo: number
  metasConcluidas: number
}

export const obterResumoMetas = async (): Promise<ResumoMetas> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Mock data baseado no retorno do backend
  const resumo: ResumoMetas = {
    totalMetas: 47,
    metasEmAndamento: 32,
    metasVencendo: 8,
    metasConcluidas: 15,
  }

  return Promise.resolve(resumo)

  // In production:
  // return api.get('/metas/resumo')
}
