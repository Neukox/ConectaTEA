import { useQuery } from '@tanstack/react-query'
import { getDistribuicaoPorCategoria } from '../services'
import { QUERY_KEYS } from '~/api/query-client'
import type { DistribuicaoPorCategoriaData } from '../types'
import type { AxiosError } from 'axios'
import type { ResponseError } from '~/api/types'

export default function useDistribuicaoCategoriaProgresso() {
  return useQuery<DistribuicaoPorCategoriaData, AxiosError<ResponseError>>({
    queryFn: getDistribuicaoPorCategoria,
    queryKey: [QUERY_KEYS.DISTRIBUICAO_CATEGORIA_PROGRESSO],
    staleTime: 1 * 60 * 1000, // 1 minuto
  })
}
