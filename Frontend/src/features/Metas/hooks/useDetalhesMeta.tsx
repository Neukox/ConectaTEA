import { useQuery } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { verMeta } from '~/api/protected/axiosMetas'
import { QUERY_KEYS } from '~/api/query-client'
import type { ResponseError } from '~/api/types'
import type { MetaDetails } from '../types'

export default function useDetalhesMeta(id: number) {
  return useQuery<MetaDetails, AxiosError<ResponseError>>({
    queryKey: [QUERY_KEYS.META, id],
    queryFn: () => verMeta(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!id,
  })
}
