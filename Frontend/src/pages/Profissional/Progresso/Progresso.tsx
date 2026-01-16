import { PageLayout } from '~/components/layout'
import {
  AtualizacoesRecentes,
  atualizacoesRecentes,
  distribuicaoData,
  DistribuicaoPorCategoria,
  EvolucaoCategoriaProfissional,
  ProgressoHeader,
  progressoCriancaData,
  ProgressoPorCrianca,
  ProfissionalProgressoResumo,
} from '~/features/Progresso'

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
          <DistribuicaoPorCategoria data={distribuicaoData} />
        </div>

        {/* Charts Row 2 & Recent Updates */}
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          <ProgressoPorCrianca data={progressoCriancaData} />
          <AtualizacoesRecentes atualizacoes={atualizacoesRecentes} />
        </div>
      </div>
    </PageLayout>
  )
}
