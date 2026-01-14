import { useQuery } from '@tanstack/react-query'
import { listarMetas, type MetasFilters } from '~/api/protected/axiosMetas'
import { QUERY_KEYS } from '~/api/query-client'
import type { MetasInfo } from '../types'
import { AxiosError } from 'axios'
import type { ResponseError } from '~/api/types'

export default function useMetas(filtros?: MetasFilters) {
  return useQuery<MetasInfo[], AxiosError<ResponseError>>({
    queryKey: [QUERY_KEYS.METAS, filtros],
    queryFn: () => listarMetas(filtros),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
