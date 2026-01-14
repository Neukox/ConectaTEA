import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      gcTime: Infinity, // Nunca limpar do cache
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export const QUERY_KEYS = {
  DASHBOARD_PROFISSIONAL: 'dashboard-profissional',
  DASHBOARD_PROFISSIONAL_METAS: 'dashboard-profissional-metas',
  DASHBOARD_PROFISSIONAL_CRIANCAS: 'dashboard-profissional-criancas',
  METAS: 'metas',
  META: 'meta',
  METAS_RESUMO: 'metas-resumo',
  CRIANCAS: 'criancas',
}
