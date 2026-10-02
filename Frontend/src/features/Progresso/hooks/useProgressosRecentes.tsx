import { useQuery } from '@tanstack/react-query'
import { getAtualizacoesRecentes } from '../services'
import { QUERY_KEYS } from '~/api/query-client'
import type { ProgressoRecente } from '../types'
import type { AxiosError } from 'axios'
import type { ResponseError } from '~/api/types'
import useProgressoFilter from './useProgressoFilter'

export default function useProgressosRecentes() {
  const { progressoFilter } = useProgressoFilter()
  return useQuery<ProgressoRecente[], AxiosError<ResponseError>>({
    queryFn: () => getAtualizacoesRecentes(progressoFilter),
    queryKey: [QUERY_KEYS.PROGRESSOS_RECENTES, progressoFilter],
    staleTime: 1 * 60 * 1000, // 1 minuto
  })
}
