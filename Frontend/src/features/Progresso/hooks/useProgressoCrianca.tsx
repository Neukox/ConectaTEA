import { useQuery } from '@tanstack/react-query'
import { getProgressoPorCrianca } from '../services'
import { QUERY_KEYS } from '~/api/query-client'
import type { ProgressoCriancaData } from '../types'
import type { AxiosError } from 'axios'
import type { ResponseError } from '~/api/types'

export default function useProgressoCrianca() {
  return useQuery<ProgressoCriancaData[], AxiosError<ResponseError>>({
    queryFn: getProgressoPorCrianca,
    queryKey: [QUERY_KEYS.PROGRESSO_POR_CRIANCA],
    staleTime: 1 * 60 * 1000, // 1 minuto
  })
}
