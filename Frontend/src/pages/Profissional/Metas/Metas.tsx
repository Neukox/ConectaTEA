import {
  Filter,
  Target,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import { useState } from 'react'
import Header from '../../../components/layout/Header'
import { PageLayout } from '~/components/layout/PageLayout'
import { TooltipProvider } from '~/components/ui/tooltip'
import {
  SummaryCard,
  MetasList,
  FiltrosMetas,
} from '~/features/Metas/components'
import { useMetasModal } from '~/features/Metas/hooks/useMetasModal'
import type { MetasFilters } from '~/features/Metas/types'
import useDebounce from '~/hooks/useDebounce'

export default function MetasPage() {
  const { openCadastrarMetaModal } = useMetasModal()
  const [filtros, setFiltros] = useState<MetasFilters>({})
  const [searchTerm, setSearchTerm] = useState('')

  const atualizarFiltrosDebounced = useDebounce(
    (novosFiltros: MetasFilters) => {
      setFiltros(novosFiltros)
    },
    500,
  )

  const handleAplicarFiltros = (novosFiltros: MetasFilters) => {
    setFiltros(novosFiltros)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)

    atualizarFiltrosDebounced({ ...filtros, search: value })
  }

  return (
    <PageLayout>
      <Header
        title='Metas'
        description='Gerencie as metas terapêuticas das crianças'
      >
        <button
          onClick={() => openCadastrarMetaModal()}
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
                value={searchTerm}
                onChange={handleSearchChange}
                className='w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100'
              />
            </div>
            <FiltrosMetas
              filtros={filtros}
              onAplicarFiltros={handleAplicarFiltros}
            >
              <button className='inline-flex items-center gap-2 rounded-md border border-green-300 px-4 py-2 text-sm font-medium text-green-800 hover:bg-green-50'>
                <Filter className='h-4 w-4' />
                Filtrar
              </button>
            </FiltrosMetas>
          </div>
        </div>
      </div>

      {/* Lista de Metas */}
      <MetasList filtros={filtros} />
    </PageLayout>
  )
}
