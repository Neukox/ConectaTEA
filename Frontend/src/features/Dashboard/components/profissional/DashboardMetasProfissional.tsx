import DashboardMetasProfissionalLoading from './metas/DashboardMetasProfissionalLoading'
import DashboardMetaCard from './metas/DashboardMetaCard'
import { useDashboardProfissionalMetas } from '~/features/Dashboard/hooks/useDashboardProfissionalMetas'
import DashboardProfissionalError from './DashboardProfissionalError'
import type { DadosMetasDashboard } from '~/features/Dashboard/types'
import { useNavigate } from 'react-router-dom'

export default function DashboardMetasProfissional() {
  const { data, isPending, isError, refetch, isFetching, error } =
    useDashboardProfissionalMetas()

  const navigate = useNavigate()

  if (isPending) {
    return <DashboardMetasProfissionalLoading />
  }

  if (isError || !data) {
    return (
      <DashboardProfissionalError
        onRetry={refetch}
        isRetrying={isFetching}
        errorMessage='Erro ao carregar metas'
        errorDescription={error.message}
      />
    )
  }

  if (data.length === 0) {
    return (
      <div className='rounded-xl border border-dashed border-gray-200 bg-white px-6 py-10 text-center text-gray-500'>
        Nenhuma meta em andamento no momento.
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {data.map((meta: DadosMetasDashboard) => (
        <DashboardMetaCard
          key={meta.id}
          meta={meta}
          onCardClick={() =>
            navigate(`/profissional/metas/detalhes/${meta.id}`)
          }
        />
      ))}
    </div>
  )
}
