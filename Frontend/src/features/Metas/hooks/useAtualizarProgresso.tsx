import { useMutation } from '@tanstack/react-query'
import {
  atualizarProgresso,
  type AtualizarProgressoData,
} from '~/api/protected/axiosMetas'
import { QUERY_KEYS, queryClient } from '~/api/query-client'
import { AxiosError } from 'axios'
import type { ResponseError } from '~/api/types'

export default function useAtualizarProgresso(actions: {
  success?: (data: any) => void
  error?: (error: any) => void
}) {
  return useMutation<void, AxiosError<ResponseError>, AtualizarProgressoData>({
    mutationFn: atualizarProgresso,
    onSuccess: (data, newData) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.METAS] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.META, newData.id] })
      actions.success?.(data)
    },
    onError: (error) => {
      actions.error?.(error)
    },
  })
}
