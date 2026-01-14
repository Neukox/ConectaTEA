import { useQuery } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { obterResumoMetas, type ResumoMetas } from '~/api/protected/axiosMetas'
import { QUERY_KEYS } from '~/api/query-client'
import type { ResponseError } from '~/api/types'

export default function useResumoMetas() {
  return useQuery<ResumoMetas, AxiosError<ResponseError>>({
    queryKey: [QUERY_KEYS.METAS_RESUMO],
    queryFn: obterResumoMetas,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
