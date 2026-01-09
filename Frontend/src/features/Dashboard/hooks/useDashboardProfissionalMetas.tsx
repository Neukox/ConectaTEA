import { useQuery } from '@tanstack/react-query'
import { getMetasDashboardProfissional } from '../services'
import { QUERY_KEYS } from '~/api/query-client'
import type { DadosMetasDashboard } from '../types'

export function useDashboardProfissionalMetas() {
  return useQuery<DadosMetasDashboard[]>({
    queryKey: [QUERY_KEYS.DASHBOARD_PROFISSIONAL_METAS],
    queryFn: getMetasDashboardProfissional,
  })
}
