import { useMutation } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { queryClient, QUERY_KEYS } from '~/api/query-client'
import type { ResponseError } from '~/api/types'
import { updateSessao } from '../services'
import type { SessaoToEdit } from '../types'

export default function useEditarSessao(actions: {
  success?: () => void
  error?: (error?: AxiosError<ResponseError>) => void
}) {
  return useMutation<void, AxiosError<ResponseError>, SessaoToEdit>({
    mutationFn: updateSessao,
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
