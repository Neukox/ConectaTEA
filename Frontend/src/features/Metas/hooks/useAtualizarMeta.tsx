import { useMutation } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { atualizarMeta } from '~/api/protected/axiosMetas'
import { queryClient, QUERY_KEYS } from '~/api/query-client'
import type { ResponseError } from '~/api/types'
import type { UpdateMetaData } from '../schemas/update-meta.schema'

export default function useCadastrarMeta(
  id: number,
  actions: {
    success?: (data?: UpdateMetaData) => void
    error?: (error?: AxiosError<ResponseError> | Error) => void
  },
) {
  return useMutation<void, AxiosError<ResponseError>, UpdateMetaData>({
    mutationFn: (data) => atualizarMeta(id, data),
    onSuccess: (_, data) => {
      actions.success?.(data)
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.METAS] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.METAS_RESUMO] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.META, id] })
    },
    onError: (error) => {
      actions.error?.(error)
    },
  })
}
