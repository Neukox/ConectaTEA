import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { cadastrarMeta } from '~/api/protected/axiosMetas'
import { queryClient, QUERY_KEYS } from '~/api/query-client'
import type { ResponseError } from '~/api/types'
import type { CreateMetaData } from '../schemas/create-meta.schema'

export default function useCadastrarMeta(actions: {
  success?: () => void
  error?: (error?: AxiosError<ResponseError> | Error) => void
}) {
  return useMutation<void, AxiosError<ResponseError>, CreateMetaData>({
    mutationFn: cadastrarMeta,
    onSuccess: () => {
      actions.success?.()
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.METAS] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.METAS_RESUMO] })
    },
    onError: (error) => {
      actions.error?.(error)
    },
  })
}
