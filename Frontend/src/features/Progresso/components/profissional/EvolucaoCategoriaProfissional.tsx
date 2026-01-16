import { EvolucaoPorCategoria } from '../EvolucaoPorCategoria'
import useEvolucaoCategoriaProgresso from '../../hooks/useEvolucaoCategoriaProgresso'
import { Skeleton } from '~/components/ui/skeleton'
import NotFoundData from '~/components/common/NotFoundData'
import { MdOutlineSsidChart } from 'react-icons/md'
import { ErrorContainer } from '~/components/common/ErrorContainer'

/**
 * Componente wrapper para o gráfico de evolução por categoria
 * Gerencia estados de loading, erro e sucesso usando Tanstack Query
 * @returns Gráfico de evolução com estados de loading e erro
 */
export function EvolucaoCategoriaProfissional() {
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useEvolucaoCategoriaProgresso()

  // Estado de carregamento
  if (isLoading) {
    return <Skeleton className='h-100' />
  }

  // Estado de erro
  if (isError) {
    const errorMessage =
      error?.response?.data?.message ||
      'Não foi possível carregar os dados de evolução.'

    return (
      <ErrorContainer
        errorMessage='Falha ao carregar dados'
        errorDescription={errorMessage}
        onRetry={() => refetch()}
        isRetrying={isRefetching}
        className='h-100'
      />
    )
  }

  // Estado de sucesso - sem dados
  if (!data || data.length === 0) {
    return (
      <NotFoundData
        className='h-100'
        icon={MdOutlineSsidChart}
        title='Nenhuma evolução encontrada'
        subtitle='Ainda não há dados de evolução para exibir.'
      />
    )
  }

  // Estado de sucesso - com dados
  return <EvolucaoPorCategoria data={data} />
}
