import React from 'react'
import SummaryCard from '~/components/common/SummaryCard'
import { IoTodayOutline } from 'react-icons/io5'
import { BsCalendar2Check, BsCalendar4Week } from "react-icons/bs";
import { LuCalendarClock } from 'react-icons/lu';
import useSessoesResumo from '../hooks/useSessoesResumo';
import { ErrorContainer } from '~/components/common/ErrorContainer';
import { SummaryCardSkeleton } from '~/components/common/SummaryCardSkeleton';

export const ResumoSessoes: React.FC = () => {
  const { data, isLoading, isError, refetch, error, isRefetching } =
      useSessoesResumo()
  
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
    <div className='mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
      <SummaryCard
        icon={IoTodayOutline}
        sub='Hoje'
        value={data?.sessoes_hoje}
        color='blue'
        iconColor='blue'
      />
      <SummaryCard
        icon={BsCalendar2Check}
        sub='Concluídas'
        value={data?.sessoes_concluidas}
        color='green'
        iconColor='green'
      />
      <SummaryCard
        icon={BsCalendar4Week}
        sub='Esta Semana'
        value={data?.sessoes_esta_semana}
        color='violet'
        iconColor='violet'
      />
      <SummaryCard
        icon={LuCalendarClock}
        sub='Pendentes'
        value={data?.sessoes_pendentes}
        color='orange'
        iconColor='orange'
      />
    </div>
  )
}
