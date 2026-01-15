import type { CreateMetaData } from '~/features/Metas/schemas/create-meta.schema'
import type { UpdateMetaData } from '~/features/Metas/schemas/update-meta.schema'
import { api } from '../httpClient'

export const cadastrarMeta = async (data: CreateMetaData): Promise<void> => {
  const response = await api.post('/metas', data)
  return response.data
}

export const atualizarMeta = async (
  id: number,
  data: UpdateMetaData,
): Promise<void> => {
  const response = await api.put(`/metas/${id}`, data)
  return response.data
}

export interface AtualizarProgressoData {
  id: number
  progresso: number
  descricao?: string
}

export const atualizarProgresso = async (data: AtualizarProgressoData) => {
  const response = await api.patch(`/metas/${data.id}/progresso`, {
    progresso: data.progresso,
    descricao: data.descricao,
  })

  return response.data
}

export interface MetasFilters {
  categoria?: string
  prioridade?: string
  status?: string
  periodo?: string
  search?: string
}

export const listarMetas = async (filtros?: MetasFilters) => {
  const response = await api.get('/metas', { params: filtros })
  return response.data
}

export const verMeta = async (id: number) => {
  const response = await api.get(`/metas/${id}`)
  return response.data
}

export interface ResumoMetas {
  totalMetas: number
  metasEmAndamento: number
  metasVencendo: number
  metasConcluidas: number
}

export const obterResumoMetas = async (): Promise<ResumoMetas> => {
  const response = await api.get('/metas/resumo')
  return response.data
}
