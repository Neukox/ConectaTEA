import { useQuery } from '@tanstack/react-query'
import { getSessoesSummary } from '../services'
import type { SessoesSummary } from '../types'
import { AxiosError } from 'axios'
import type { ResponseError } from '~/api/types'
import { QUERY_KEYS } from '~/api/query-client'

export default function useSessoesResumo() {
  return useQuery<SessoesSummary, AxiosError<ResponseError>>({
    queryKey: [QUERY_KEYS.SESSOES_RESUMO],
    queryFn: getSessoesSummary,
  })
}
