import { useQuery } from '@tanstack/react-query'
import { getDadosDashboardProfissional } from '../services'
import { QUERY_KEYS } from '~/api/query-client'
import type { DadosDashboard } from '../types'

export function useDashboardProfissional() {
  return useQuery<DadosDashboard>({
    queryKey: [QUERY_KEYS.DASHBOARD_PROFISSIONAL],
    queryFn: getDadosDashboardProfissional,
  })
}
