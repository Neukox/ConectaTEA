import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '~/api/query-client'
import {
  contarNaoLidas,
  listarNotificacoes,
  marcarComoLida,
  marcarTodasComoLidas,
} from './service'

const listKey = [QUERY_KEYS.NOTIFICACOES]
const countKey = [QUERY_KEYS.NOTIFICACOES_NAO_LIDAS]

export function useNotificacoesPersistentes(enabled: boolean) {
  return useQuery({ queryKey: listKey, queryFn: listarNotificacoes, enabled })
}

export function useContadorNotificacoes(enabled: boolean) {
  return useQuery({
    queryKey: countKey,
    queryFn: contarNaoLidas,
    enabled,
    refetchInterval: 30_000,
  })
}

export function useMarcarNotificacaoLida() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: marcarComoLida,
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: listKey }),
        client.invalidateQueries({ queryKey: countKey }),
      ])
    },
  })
}

export function useMarcarTodasNotificacoesLidas() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: marcarTodasComoLidas,
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: listKey }),
        client.invalidateQueries({ queryKey: countKey }),
      ])
    },
  })
}
