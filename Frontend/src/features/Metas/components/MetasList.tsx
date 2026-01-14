import useMetas from '../hooks/useMetas'
import { MetaCard } from './MetaCard'
import MetaCardsSkeleton from './MetaCardsSkeleton'
import { ErrorContainer } from '~/components/common/ErrorContainer'
import NotFoundData from '~/components/common/NotFoundData'

export function MetasList() {
  const {
    data: metas,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useMetas()

  if (isLoading) {
    return (
      <div className='mt-4 space-y-4'>
        <MetaCardsSkeleton />
      </div>
    )
  }

  if (isError) {
    // Tenta extrair mensagem de erro do backend
    const errorMessage =
      error instanceof Error ? error.message : 'Erro ao carregar metas'

    const errorDescription =
      error?.response?.data?.message ||
      'Não foi possível carregar as metas. Por favor, tente novamente.'

    return (
      <div className='mt-6'>
        <ErrorContainer
          errorMessage={errorMessage}
          errorDescription={errorDescription}
          onRetry={() => refetch()}
          isRetrying={isRefetching}
          className='h-100'
        />
      </div>
    )
  }

  if (!metas || metas.length === 0) {
    return (
      <NotFoundData
        title='Nenhuma meta encontrada'
        subtitle='Comece criando uma nova meta para as crianças.'
        className='h-100 bg-gray-100'
      />
    )
  }

  return (
    <div className='mt-6 space-y-5'>
      {metas.map((meta) => (
        <MetaCard
          key={meta.id}
          meta={meta}
        />
      ))}
    </div>
  )
}
