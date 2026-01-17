import { useQuery } from '@tanstack/react-query'
import { getDistribuicaoPorCategoria } from '../services'
import { QUERY_KEYS } from '~/api/query-client'
import type { DistribuicaoPorCategoriaData } from '../types'
import type { AxiosError } from 'axios'
import type { ResponseError } from '~/api/types'
import useProgressoFilter from './useProgressoFilter'

export default function useDistribuicaoCategoriaProgresso() {
  const { progressoFilter } = useProgressoFilter()

  return useQuery<DistribuicaoPorCategoriaData, AxiosError<ResponseError>>({
    queryFn: () => getDistribuicaoPorCategoria(progressoFilter),
    queryKey: [QUERY_KEYS.DISTRIBUICAO_CATEGORIA_PROGRESSO, progressoFilter],
    staleTime: 1 * 60 * 1000, // 1 minuto
  })
}
