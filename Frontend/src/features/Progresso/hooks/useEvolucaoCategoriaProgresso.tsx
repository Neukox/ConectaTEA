import { useQuery } from '@tanstack/react-query'
import { getEvolucaoPorCategoria } from '../services'
import { QUERY_KEYS } from '~/api/query-client'
import type { EvolucaoPorCategoriaData } from '../types'
import type { AxiosError } from 'axios'
import type { ResponseError } from '~/api/types'
import useProgressoFilter from './useProgressoFilter'

export default function useEvolucaoCategoriaProgresso() {
  const { progressoFilter } = useProgressoFilter();
  
  return useQuery<EvolucaoPorCategoriaData[], AxiosError<ResponseError>>({
    queryFn: () => getEvolucaoPorCategoria(progressoFilter),
    queryKey: [QUERY_KEYS.EVOLUCAO_CATEGORIA_PROGRESSO, progressoFilter],
    staleTime: 1 * 60 * 1000, // 1 minuto
  })
}
