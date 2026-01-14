import { Target, TrendingUp, CheckCircle2, AlertTriangle } from 'lucide-react'
import { TooltipProvider } from '~/components/ui/tooltip'
import { SummaryCardMeta } from './SummaryCardMeta'
import { SummaryCardSkeleton } from '../../../components/common/SummaryCardSkeleton'
import { ErrorContainer } from '~/components/common/ErrorContainer'
import useResumoMetas from '../hooks/useResumoMetas'

export function ResumoMetas() {
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useResumoMetas()

  if (isLoading) {
    return (
      <div className='mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
        <SummaryCardSkeleton />
        <SummaryCardSkeleton />
        <SummaryCardSkeleton />
        <SummaryCardSkeleton />
      </div>
    )
  }

  if (isError) {
    const errorMessage =
      error instanceof Error ? error.message : 'Erro ao carregar resumo'

    const errorDescription =
      error?.response?.data?.message ||
      'Não foi possível carregar o resumo das metas. Por favor, tente novamente.'

    return (
      <ErrorContainer
        errorMessage={errorMessage}
        errorDescription={errorDescription}
        onRetry={() => refetch()}
        isRetrying={isRefetching}
        className='mb-8'
      />
    )
  }

  if (!data) {
    return null
  }

  return (
    <TooltipProvider>
      <div className='mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
        <SummaryCardMeta
          icon={Target}
          label='Total de Metas'
          value={data.totalMetas}
          tooltip='Quantidade total de metas cadastradas.'
        />
        <SummaryCardMeta
          icon={TrendingUp}
          label='Em Andamento'
          value={data.metasEmAndamento}
          tooltip='Metas que estão em andamento no momento.'
        />
        <SummaryCardMeta
          icon={AlertTriangle}
          label='Vencendo'
          value={data.metasVencendo}
          tooltip='Metas próximas do prazo de vencimento.'
        />
        <SummaryCardMeta
          icon={CheckCircle2}
          label='Concluídas'
          value={data.metasConcluidas}
          tooltip='Metas já concluídas.'
        />
      </div>
    </TooltipProvider>
  )
}
