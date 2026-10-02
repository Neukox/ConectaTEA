import { api } from '../apiClient'

export interface LocalAtendimento { id: number; nome: string; cidade: string }
export interface RedeSocial { id: number; tipo: string; url: string }
export interface AreaAtuacao { id: number; nome: string }

export const listarMeusLocais = async () => (await api.get<LocalAtendimento[]>('/profissionais/me/locais-atendimento')).data
export const criarLocal = async (payload: Omit<LocalAtendimento, 'id'>) => (await api.post<LocalAtendimento>('/profissionais/me/locais-atendimento', payload)).data
export const atualizarLocal = async (id: number, payload: Omit<LocalAtendimento, 'id'>) => (await api.put<LocalAtendimento>(`/profissionais/me/locais-atendimento/${id}`, payload)).data
export const excluirLocal = async (id: number) => api.delete(`/profissionais/me/locais-atendimento/${id}`)

export const listarMinhasRedes = async () => (await api.get<RedeSocial[]>('/profissionais/me/redes-sociais')).data
export const criarRede = async (payload: Omit<RedeSocial, 'id'>) => (await api.post<RedeSocial>('/profissionais/me/redes-sociais', payload)).data
export const atualizarRede = async (id: number, payload: Omit<RedeSocial, 'id'>) => (await api.put<RedeSocial>(`/profissionais/me/redes-sociais/${id}`, payload)).data
export const excluirRede = async (id: number) => api.delete(`/profissionais/me/redes-sociais/${id}`)

export const listarAreas = async () => (await api.get<AreaAtuacao[]>('/areas-atuacao')).data
export const listarMinhasAreas = async () => (await api.get<AreaAtuacao[]>('/profissionais/me/areas-atuacao')).data
export const vincularArea = async (areaId: number) => (await api.post<AreaAtuacao>('/profissionais/me/areas-atuacao', { areaId })).data
export const desvincularArea = async (areaId: number) => api.delete(`/profissionais/me/areas-atuacao/${areaId}`)
