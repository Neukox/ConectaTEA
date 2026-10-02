import { useMutation } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { queryClient, QUERY_KEYS } from '~/api/query-client'
import type { ResponseError } from '~/api/types'
import { createSessao, type CreateSessaoRequest } from '../services'
import type { Sessao } from '../types'

export default function useAgendarSessao(actions: {
  success?: () => void
  error?: (error?: AxiosError<ResponseError>) => void
}) {
  return useMutation<Sessao, AxiosError<ResponseError>, CreateSessaoRequest>({
    mutationFn: createSessao,
    onSuccess: () => {
      actions.success?.()
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SESSOES] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SESSOES_RESUMO] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD_RESPONSAVEL] })
    },
    onError: (error) => {
      actions.error?.(error)
    },
  })
}
