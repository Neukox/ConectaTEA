import { ErrorContainer } from '~/components/common/ErrorContainer'
import useSessoes from '../hooks/useSessoes'
import { SessoesList } from './SessoesList'
import SessoesListLoading from './SessaoListLoading'
import type { SessoesFilters } from '../types'

interface SessoesListContainerProps {
  filters: SessoesFilters
}

export function SessoesListContainer({ filters }: SessoesListContainerProps) {
  const { data, isLoading, isFetching, isError, error, refetch } =
    useSessoes(filters)

  // Show loading state
  if (isLoading || isFetching) {
    return <SessoesListLoading />
  }

  // Show error state
  if (isError) {
    return (
      <div className='@container lg:col-span-2'>
        <ErrorContainer
          errorMessage='Erro ao carregar sessões'
          errorDescription={
            error.response?.data?.message ||
            'Não foi possível carregar as sessões. Por favor, tente novamente.'
          }
          onRetry={() => refetch()}
          isRetrying={isLoading}
          className='min-h-120'
        />
      </div>
    )
  }

  return (
    <>
      <SessoesList sessoes={data || []} />
    </>
  )
}
