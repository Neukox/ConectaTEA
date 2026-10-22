import { api } from '~/api/apiClient'
import type { NotificacaoPersistente } from './types'

export async function listarNotificacoes(): Promise<NotificacaoPersistente[]> {
  return (await api.get<NotificacaoPersistente[]>('/notificacoes')).data
}

export async function listarNotificacoesSino(): Promise<NotificacaoPersistente[]> {
  return (await api.get<NotificacaoPersistente[]>('/notificacoes/sino')).data
}

export async function contarNaoLidas(): Promise<number> {
  return (await api.get<{ count: number }>('/notificacoes/nao-lidas/count')).data.count
}

export async function marcarComoLida(id: number): Promise<NotificacaoPersistente> {
  return (await api.patch<NotificacaoPersistente>(`/notificacoes/${id}/lida`)).data
}

export async function marcarTodasComoLidas(): Promise<number> {
  return (await api.patch<{ updated: number }>('/notificacoes/lidas')).data.updated
}

export async function limparSino(): Promise<number> {
  return (await api.patch<{ hidden: number }>('/notificacoes/sino/limpar')).data
    .hidden
}
