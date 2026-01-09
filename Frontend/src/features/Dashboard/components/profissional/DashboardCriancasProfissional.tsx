import { useNavigate } from 'react-router-dom'
import DashboardCriancaCard from './criancas/DashboardCriancaCard'
import DashboardProfissionalError from './DashboardProfissionalError'
import DashboardCriancasProfissionalLoading from './criancas/DashboardCriancasProfissionalLoading'
import { useDashboardProfissionalCriancas } from '~/features/Dashboard/hooks/useDashboardProfissionalCriancas'
import type { DadosCriancasDashboard } from '~/features/Dashboard/types'

// Função para gerar URL de avatar baseada no nome
// TODO: substituir por dados reais no backend quando for implementado. Por enquanto, usamos um gerador de avatares.
const buildAvatarUrl = (nome: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=random`

export default function DashboardCriancasProfissional() {
  const { data, isPending, isError, refetch, isFetching, error } =
    useDashboardProfissionalCriancas()
  const navigate = useNavigate()

  if (isPending) {
    return <DashboardCriancasProfissionalLoading />
  }

  if (isError || !data) {
    return (
      <DashboardProfissionalError
        onRetry={refetch}
        isRetrying={isFetching}
        errorMessage='Erro ao carregar as crianças'
        errorDescription={error.message}
      />
    )
  }

  if (data.length === 0) {
    return (
      <div className='rounded-xl border border-dashed border-gray-200 bg-white px-6 py-10 text-center text-gray-500'>
        Nenhuma criança vinculada no momento.
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {data.map((crianca: DadosCriancasDashboard) => (
        <DashboardCriancaCard
          key={crianca.criancaId}
          crianca={{
            ...crianca,
            avatar: buildAvatarUrl(crianca.nome),
          }}
          onCardClick={() =>
            navigate(`/profissional/criancas/detalhes/${crianca.criancaId}`)
          }
        />
      ))}
    </div>
  )
}
