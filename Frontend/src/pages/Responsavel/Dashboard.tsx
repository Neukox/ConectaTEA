import { useQuery } from '@tanstack/react-query'
import { CalendarClock, Smile, Target, TrendingUp } from 'lucide-react'
import { QUERY_KEYS } from '~/api/query-client'
import SummaryCard from '~/components/common/SummaryCard'
import { ErrorContainer } from '~/components/common/ErrorContainer'
import { SummaryCardSkeleton } from '~/components/common/SummaryCardSkeleton'
import Header from '~/components/layout/Header'
import { PageLayout } from '~/components/layout'
import { getDadosDashboardResponsavel } from '~/features/Dashboard/services'

export default function DashboardResponsavel() {
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD_RESPONSAVEL],
    queryFn: getDadosDashboardResponsavel,
  })

  return (
    <PageLayout>
      <Header
        title='Dashboard'
        description='Acompanhe as crianças vinculadas e suas atividades'
      />

      {isLoading && (
        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
          {Array.from({ length: 4 }).map((_, index) => (
            <SummaryCardSkeleton key={index} />
          ))}
        </div>
      )}

      {isError && (
        <ErrorContainer
          errorMessage='Erro ao carregar o dashboard'
          errorDescription='Não foi possível obter os indicadores agora.'
          onRetry={() => refetch()}
          isRetrying={isRefetching}
        />
      )}

      {data && (
        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
          <SummaryCard icon={Smile} label='Crianças' value={data.totalCriancas} color='green' iconColor='green' />
          <SummaryCard icon={Target} label='Metas' value={data.totalMetas} color='blue' iconColor='blue' />
          <SummaryCard icon={CalendarClock} label='Próximas sessões' value={data.sessoesProximas} color='violet' iconColor='violet' />
          <SummaryCard icon={TrendingUp} label='Progresso médio' value={`${data.taxaProgresso}%`} color='orange' iconColor='orange' />
        </div>
      )}
    </PageLayout>
  )
}
