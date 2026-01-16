import { useQuery } from '@tanstack/react-query'
import { getAtualizacoesRecentes } from '../services'
import { QUERY_KEYS } from '~/api/query-client'
import type { ProgressoRecente } from '../types'
import type { AxiosError } from 'axios'
import type { ResponseError } from '~/api/types'

export default function useProgressosRecentes() {
  return useQuery<ProgressoRecente[], AxiosError<ResponseError>>({
    queryFn: getAtualizacoesRecentes,
    queryKey: [QUERY_KEYS.PROGRESSOS_RECENTES],
    staleTime: 1 * 60 * 1000, // 1 minuto
  })
}
