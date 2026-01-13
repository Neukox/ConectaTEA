import React from 'react'
import { Filter, Target, TrendingUp, CheckCircle2, AlertTriangle } from 'lucide-react'
import Header from '../../../components/layout/Header'
import { PageLayout } from '~/components/layout/PageLayout'
import { CadastrarMetaDialog, AtualizarProgressoDialog } from '~/features/Metas'
import { type CadastroMetaData } from '~/api/protected/axiosMetas'
import { TooltipProvider } from '~/components/ui/tooltip'
import { SummaryCard, MetaCard, metas, type Meta } from '~/features/Metas/components'

export default function MetasPage() {
  const [showModal, setShowModal] = React.useState(false)
  const [metaParaEditar, setMetaParaEditar] = React.useState<
    (CadastroMetaData & { id: number }) | null
  >(null)
  const [showProgressoModal, setShowProgressoModal] = React.useState(false)
  const [metaParaProgresso, setMetaParaProgresso] = React.useState<{
    id: number
    titulo: string
    progresso: number
  } | null>(null)

  const handleEdit = (meta: Meta) => {
    // Converter Meta para CadastroMetaData (adaptar campos se necessário)
    const metaData: CadastroMetaData & { id: number } = {
      id: meta.id,
      titulo: meta.titulo,
      categoria: meta.categoria,
      prioridade: meta.prioridade,
      criancaId: 1, // Mock ID, já que não temos o ID real da criança na interface Meta
      dataInicio: meta.periodo.split(' - ')[0].split('/').reverse().join('-'), // Converter DD/MM/YYYY para YYYY-MM-DD
      dataFim: meta.periodo.split(' - ')[1].split('/').reverse().join('-'),
      descricao: meta.descricao || '',
    }
    setMetaParaEditar(metaData)
    setShowModal(true)
  }

  const handleCloseModal = (open: boolean) => {
    setShowModal(open)
    if (!open) {
      setMetaParaEditar(null)
    }
  }

  const handleUpdateProgress = (meta: Meta) => {
    setMetaParaProgresso({
      id: meta.id,
      titulo: meta.titulo,
      progresso: meta.progresso,
    })
    setShowProgressoModal(true)
  }

  const handleCloseProgressoModal = (open: boolean) => {
    setShowProgressoModal(open)
    if (!open) {
      setMetaParaProgresso(null)
    }
  }

  return (
    <PageLayout>
      <Header
        title='Metas'
        description='Gerencie as metas terapêuticas das crianças'
      >
        <button
          onClick={() => setShowModal(true)}
          className='flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2 text-white transition-colors hover:bg-green-700'
        >
          <span className='text-lg'>+</span>
          Nova Meta
        </button>
      </Header>

      {/* Toolbar topo */}
      <div className='mt-6'>
        <div>
          <TooltipProvider>
            <div className='mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
              <SummaryCard
                icon={Target}
                label='Total de Metas'
                value={47}
                tooltip='Quantidade total de metas cadastradas.'
              />
              <SummaryCard
                icon={TrendingUp}
                label='Em Andamento'
                value={32}
                tooltip='Metas que estão em andamento no momento.'
              />
              <SummaryCard
                icon={AlertTriangle}
                label='Vencendo'
                value={8}
                tooltip='Metas próximas do prazo de vencimento.'
              />
              <SummaryCard
                icon={CheckCircle2}
                label='Concluídas'
                value={15}
                tooltip='Metas já concluídas.'
              />
            </div>
          </TooltipProvider>
        </div>
      </div>

      {/* Busca + Filtro */}
      <div className='mx-auto max-w-7xl'>
        <div className='mt-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:px-8'>
          <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
            <div className='relative w-full md:max-w-xl'>
              <input
                type='text'
                placeholder='Buscar metas por nome da criança ou título...'
                className='w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100'
              />
            </div>
            <button className='inline-flex items-center gap-2 rounded-md border border-green-300 px-4 py-2 text-sm font-medium text-green-800 hover:bg-green-50'>
              <Filter className='h-4 w-4' />
              Filtrar
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Metas */}
      <div className='mt-6 space-y-5'>
        {metas.map((m) => (
          <MetaCard
            key={m.id}
            meta={m}
            onEdit={handleEdit}
            onUpdateProgress={handleUpdateProgress}
          />
        ))}
      </div>

      <CadastrarMetaDialog
        open={showModal}
        onOpenChange={handleCloseModal}
        metaToEdit={metaParaEditar}
      />

      <AtualizarProgressoDialog
        open={showProgressoModal}
        onOpenChange={handleCloseProgressoModal}
        meta={metaParaProgresso}
      />
    </PageLayout>
  )
}
