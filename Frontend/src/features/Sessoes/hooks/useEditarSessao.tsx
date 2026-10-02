import { useMutation } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { queryClient, QUERY_KEYS } from '~/api/query-client'
import type { ResponseError } from '~/api/types'
import { updateSessao, type UpdateSessaoRequest } from '../services'
import type { Sessao } from '../types'

export default function useEditarSessao(actions: {
  success?: () => void
  error?: (error?: AxiosError<ResponseError>) => void
}) {
  return useMutation<
    Sessao,
    AxiosError<ResponseError>,
    UpdateSessaoRequest & { id: number }
  >({
    mutationFn: ({id, ...data}) => updateSessao(id, data),
    onSuccess: () => {
      actions.success?.()
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SESSOES] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SESSOES_RESUMO] })
    },
    onError: (error) => {
      actions.error?.(error)
    },
  })
}
