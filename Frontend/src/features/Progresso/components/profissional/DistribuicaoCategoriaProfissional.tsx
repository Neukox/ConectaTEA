import { ErrorContainer } from '~/components/common/ErrorContainer'
import useDistribuicaoCategoriaProgresso from '../../hooks/useDistribuicaoCategoriaProgresso'
import { DistribuicaoPorCategoria } from '../DistribuicaoPorCategoria'
import { DistribuicaoPorCategoriaLoading } from '../DistribuicaoPorCategoriaLoading'
import type { DistribuicaoPorCategoriaData } from '../../types'

export default function DistribuicaoCategoriaProfissional() {
  const { data, isLoading, isError, error, isRefetching, refetch } =
    useDistribuicaoCategoriaProgresso()

  if (isLoading) {
    return <DistribuicaoPorCategoriaLoading />
  }

  if (isError) {
    const errorMessage =
      error?.response?.data?.message ||
      'Não foi possível carregar os dados de distribuição por categoria.'

    return (
      <ErrorContainer
        errorMessage='Erro ao carregar os dados.'
        errorDescription={errorMessage}
        onRetry={() => refetch()}
        isRetrying={isRefetching}
        className='h-100'
      />
    )
  }

  return (
    <DistribuicaoPorCategoria data={data as DistribuicaoPorCategoriaData} />
  )
}
