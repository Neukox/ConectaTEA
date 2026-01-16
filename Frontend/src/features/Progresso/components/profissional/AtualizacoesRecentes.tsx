import NotFoundData from '~/components/common/NotFoundData'
import useProgressosRecentes from '../../hooks/useProgressosRecentes'
import { AtualizacaoCard } from '../AtualizacaoCard'
import { AtualizacaoCardSkeleton } from '../AtualizacaoCardSkeleton'
import { ErrorContainer } from '~/components/common/ErrorContainer'

export function AtualizacoesRecentes() {
  const { data, isLoading, isError, error, refetch } = useProgressosRecentes()

  if (isLoading) {
    return (
      <div className='space-y-4'>
        {Array.from({ length: 3 }).map((_, index) => (
          <AtualizacaoCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (isError) {
    const errorMessage =
      error.response?.data?.message ||
      'Ocorreu um erro ao buscar as atualizações recentes.'
    return (
      <ErrorContainer
        errorMessage='Erro ao carregar atualizações'
        errorDescription={errorMessage}
        onRetry={refetch}
        className='min-h-80'
      />
    )
  }

  if (!data || data.length === 0) {
    return (
      <NotFoundData
        title='Nenhuma atualização recente'
        subtitle='Ainda não há atualizações recentes para mostrar.'
        className='min-h-80'
      />
    )
  }

  return (
    <div className='space-y-4'>
      {data?.map((item) => (
        <AtualizacaoCard
          key={item.id}
          data={item}
        />
      ))}
    </div>
  )
}
