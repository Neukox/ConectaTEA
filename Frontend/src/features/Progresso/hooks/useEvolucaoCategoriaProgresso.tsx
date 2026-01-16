import { useQuery } from '@tanstack/react-query'
import { getEvolucaoPorCategoria } from '../services'
import { QUERY_KEYS } from '~/api/query-client'
import type { EvolucaoPorCategoriaData } from '../types'
import type { AxiosError } from 'axios'
import type { ResponseError } from '~/api/types'

export default function useEvolucaoCategoriaProgresso() {
  return useQuery<EvolucaoPorCategoriaData[], AxiosError<ResponseError>>({
    queryFn: getEvolucaoPorCategoria,
    queryKey: [QUERY_KEYS.EVOLUCAO_CATEGORIA_PROGRESSO],
    staleTime: 1 * 60 * 1000, // 1 minuto
  })
}
