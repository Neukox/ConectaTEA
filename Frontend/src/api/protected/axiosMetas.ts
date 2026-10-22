import type { CreateMetaData } from '~/features/Metas/schemas/create-meta.schema'
import type { UpdateMetaData } from '~/features/Metas/schemas/update-meta.schema'
import { api } from '../apiClient'
import type { Meta } from '~/features/Metas/types'

export const cadastrarMeta = async (data: CreateMetaData): Promise<Meta> => {
  const response = await api.post<Meta>('/metas', data)
  return response.data
}

export const atualizarMeta = async (
  id: number,
  data: UpdateMetaData,
): Promise<Meta> => {
  const response = await api.put<Meta>(`/metas/${id}`, data)
  return response.data
}

export interface AtualizarProgressoData {
  id: number
  progresso: number
  descricao?: string
}

export const atualizarProgresso = async (data: AtualizarProgressoData): Promise<Meta> => {
  const response = await api.patch<Meta>(`/metas/${data.id}/progresso`, {
    progresso: data.progresso,
    descricao: data.descricao,
  })

  return response.data
}

export const pausarMeta = async (id: number, motivo: string): Promise<Meta> => {
  const response = await api.patch<Meta>(`/metas/${id}/pausa`, { motivo })
  return response.data
}

export const retomarMeta = async (
  id: number,
  dataFim: string,
  motivo?: string,
): Promise<Meta> => {
  const response = await api.patch<Meta>(`/metas/${id}/retomada`, { dataFim, motivo })
  return response.data
}

export const concluirMeta = async (
  id: number,
  resumoResultado: string,
): Promise<Meta> => {
  const response = await api.patch<Meta>(`/metas/${id}/conclusao`, {
    resumoResultado,
  })
  return response.data
}

export const reabrirMeta = async (
  id: number,
  dados: { motivo: string; novoPrazo: string; progressoInicial: number },
): Promise<Meta> => {
  const response = await api.patch<Meta>(`/metas/${id}/reabertura`, dados)
  return response.data
}

export interface MetasFilters {
  criancaId?: number
  categoria?: string
  prioridade?: string
  status?: string
  periodo?: 'TODOS' | 'HOJE' | 'SEMANA' | 'MES' | 'ATRASADAS'
  search?: string
}

export const listarMetas = async (filtros?: MetasFilters): Promise<Meta[]> => {
  const response = await api.get<Meta[]>('/metas', { params: filtros })
  return response.data
}

export const verMeta = async (id: number): Promise<Meta> => {
  const response = await api.get<Meta>(`/metas/${id}`)
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
