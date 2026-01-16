import { ProgressoPorCrianca } from '../ProgressoPorCrianca'
import useProgressoCrianca from '../../hooks/useProgressoCrianca'
import NotFoundData from '~/components/common/NotFoundData'
import { IoStatsChart } from 'react-icons/io5'
import { Skeleton } from '~/components/ui/skeleton'
import { ErrorContainer } from '~/components/common/ErrorContainer'

export function ProgressoPorCriancaContainer() {
  const { data, isLoading, isError, error, refetch } = useProgressoCrianca()

  if (isLoading) {
    return <Skeleton className='min-h-80 w-full flex-1 rounded-xl' />
  }

  if (isError) {
    const errorMessage =
      error?.response?.data?.message ||
      'Houve um erro dao buscar os dados de progresso por criança.'

    return (
      <ErrorContainer
        errorMessage='Erro ao carregar os dados'
        errorDescription={errorMessage}
        onRetry={refetch}
        className='min-h-80 w-full flex-1 rounded-xl'
      />
    )
  }

  if (!data || data.length === 0) {
    return (
      <NotFoundData
        title='Nao foram encontrados dados'
        subtitle='Nenhum dado de progresso por criança encontrado.'
        icon={IoStatsChart}
        className='min-h-80 flex-1 rounded-xl'
      />
    )
  }

  return <ProgressoPorCrianca data={data} />
}
