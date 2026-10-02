import { useMutation } from '@tanstack/react-query'
import {
  atualizarProgresso,
  type AtualizarProgressoData,
} from '~/api/protected/axiosMetas'
import { QUERY_KEYS, queryClient } from '~/api/query-client'
import { AxiosError } from 'axios'
import type { ResponseError } from '~/api/types'
import type { Meta } from '../types'

export default function useAtualizarProgresso(actions: {
  success?: (data: Meta) => void
  error?: (error: AxiosError<ResponseError>) => void
}) {
  return useMutation<Meta, AxiosError<ResponseError>, AtualizarProgressoData>({
    mutationFn: atualizarProgresso,
    onSuccess: (data, newData) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.METAS] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.META, newData.id] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.METAS_RESUMO] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROGRESSO_RESUMO] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROGRESSOS_RECENTES] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EVOLUCAO_CATEGORIA_PROGRESSO] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD_PROFISSIONAL] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD_PROFISSIONAL_METAS] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD_RESPONSAVEL] })
      actions.success?.(data)
    },
    onError: (error) => {
      actions.error?.(error)
    },
  })
}
