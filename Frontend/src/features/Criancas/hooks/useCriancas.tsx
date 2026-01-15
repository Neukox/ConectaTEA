import { useQuery } from '@tanstack/react-query'
import { listarCriancas } from '~/api/protected/axiosCadastroCrianca'
import { QUERY_KEYS } from '~/api/query-client'

export default function useCriancas() {
  return useQuery({
    queryKey: [QUERY_KEYS.CRIANCAS],
    queryFn: listarCriancas,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
