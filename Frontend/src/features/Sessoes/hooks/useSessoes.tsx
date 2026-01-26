import type { Sessao, SessoesFilters } from '../types'
import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '~/api/query-client'
import { getSessoes } from '../services'
import { AxiosError } from 'axios'
import type { ResponseError } from '~/api/types'

export default function useSessoes(filtros: SessoesFilters = {}) {
  return useQuery<Sessao[], AxiosError<ResponseError>>({
    queryKey: [QUERY_KEYS.SESSOES, filtros],
    queryFn: () => getSessoes(filtros),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
