import SummaryCard from '~/components/common/SummaryCard'
import { IoMdTrendingUp } from 'react-icons/io'
import { LuCircleCheckBig, LuGoal } from 'react-icons/lu'
import { FaChild } from 'react-icons/fa6'
import useResumoProgresso from '../../hooks/useResumoProgresso'
import { SummaryCardSkeleton } from '~/components/common/SummaryCardSkeleton'
import { ErrorContainer } from '~/components/common/ErrorContainer'

export function ProfissionalProgressoResumo() {
  const { data, isLoading, isError, refetch, error, isRefetching } =
    useResumoProgresso()

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
      error.response?.data.message || 'Não foi possível carregar os dados.'

    return (
      <ErrorContainer
        errorMessage='Erro ao carregar resumo'
        errorDescription={errorMessage}
        onRetry={() => refetch()}
        isRetrying={isRefetching}
        className='p-4'
      />
    )
  }

  return (
    <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
      <SummaryCard
        sub='Progresso Médio'
        value={`${data?.media_progresso}%`}
        icon={IoMdTrendingUp}
        iconColor='green'
        color='green'
      />
      <SummaryCard
        sub='Metas Ativas'
        value={data?.metas_ativas}
        icon={LuGoal}
        iconColor='blue'
        color='blue'
      />
      <SummaryCard
        sub='Metas Concluídas'
        value={data?.metas_concluidas}
        icon={LuCircleCheckBig}
        iconColor='violet'
        color='violet'
      />
      <SummaryCard
        sub='Crianças Ativas'
        value={data?.criancas_ativas}
        icon={FaChild}
        iconColor='orange'
        color='orange'
      />
    </div>
  )
}
