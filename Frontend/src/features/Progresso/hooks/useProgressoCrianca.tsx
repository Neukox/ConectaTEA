import { useQuery } from '@tanstack/react-query'
import { getProgressoPorCrianca } from '../services'
import { QUERY_KEYS } from '~/api/query-client'
import type { ProgressoCriancaData } from '../types'
import type { AxiosError } from 'axios'
import type { ResponseError } from '~/api/types'
import useProgressoFilter from './useProgressoFilter'

export default function useProgressoCrianca() {
  const { progressoFilter } = useProgressoFilter();
  
  return useQuery<ProgressoCriancaData[], AxiosError<ResponseError>>({
    queryFn: () => getProgressoPorCrianca(progressoFilter),
    queryKey: [QUERY_KEYS.PROGRESSO_POR_CRIANCA, progressoFilter],
    staleTime: 1 * 60 * 1000, // 1 minuto
  })
}
