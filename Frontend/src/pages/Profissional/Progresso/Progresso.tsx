import { PageLayout } from '~/components/layout'
import {
  AtualizacoesRecentes,
  atualizacoesRecentes,
  EvolucaoCategoriaProfissional,
  ProgressoHeader,
  ProfissionalProgressoResumo,
  ProgressoPorCriancaContainer,
} from '~/features/Progresso'
import DistribuicaoCategoriaProfissional from '~/features/Progresso/components/profissional/DistribuicaoCategoriaProfissional'

export default function Progresso() {
  const handleExport = () => {
    console.log('Exportar relatório')
  }

  const handlePeriodChange = (period: string) => {
    console.log('Período alterado:', period)
  }

  return (
    <PageLayout>
      <ProgressoHeader
        onExport={handleExport}
        onPeriodChange={handlePeriodChange}
      />

      <div className='flex flex-col gap-6'>
        {/* Stats Cards */}
        <ProfissionalProgressoResumo />
        {/* Charts Row 1 */}
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          <div className='rounded-xl border border-gray-100 bg-white p-6 shadow-sm'>
            <h3 className='mb-6 text-lg font-bold text-gray-900'>
              Evolução por Categoria
            </h3>
            <EvolucaoCategoriaProfissional />
          </div>
          <div className='rounded-xl border border-gray-100 bg-white p-6 shadow-sm'>
            <h3 className='mb-6 text-lg font-bold text-gray-900'>
              Distribuição por Categoria
            </h3>
            <DistribuicaoCategoriaProfissional />
          </div>
        </div>

        {/* Charts Row 2 & Recent Updates */}
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          <div className='flex flex-col rounded-xl border border-gray-100 bg-white p-6 shadow-sm'>
            <h3 className='mb-6 text-lg font-bold text-gray-900'>
              Progresso por Criança
            </h3>
            <ProgressoPorCriancaContainer />
          </div>
          <div className='rounded-xl border border-gray-100 bg-white p-6 shadow-sm'>
            <h3 className='mb-6 text-lg font-bold text-gray-900'>
              Atualizações Recentes
            </h3>
            <AtualizacoesRecentes />
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
