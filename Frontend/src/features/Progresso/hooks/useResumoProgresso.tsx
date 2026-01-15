import { useQuery } from '@tanstack/react-query'
import { getProgressoResumo } from '../services'
import { QUERY_KEYS } from '~/api/query-client'
import type { ProgressoStats } from '../types'
import type { AxiosError } from 'axios'
import type { ResponseError } from '~/api/types'

export default function useResumoProgresso() {
  return useQuery<ProgressoStats, AxiosError<ResponseError>>({
    queryKey: [QUERY_KEYS.PROGRESSO_RESUMO],
    queryFn: getProgressoResumo,
    staleTime: 1 * 60 * 1000, // 1 minuto
  })
}
