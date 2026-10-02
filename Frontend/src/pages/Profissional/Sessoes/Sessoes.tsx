import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { ResumoSessoes, SessoesFilters } from '~/features/Sessoes'
import NextSessions from '../../../features/Sessoes/components/NextSessions'
import QuickActions from '../../../features/Sessoes/components/QuickActions'
import ModalCalendarioCompleto from '../../../features/Sessoes/components/ModalCalendarioCompleto'
import { PageLayout } from '~/components/layout/PageLayout'
import Header from '~/components/layout/Header'
import useSessoesModal from '~/features/Sessoes/hooks/useSessoesModal'
import { SessoesListContainer } from '~/features/Sessoes/components/SessoesListContainer'
import useSessoesFilters from '~/features/Sessoes/hooks/useSessoesFilters'
import useSessoes from '~/features/Sessoes/hooks/useSessoes'

const Sessoes: React.FC = () => {
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false)

  const { openAgendarSessaoModal } = useSessoesModal()

  const { filters, aplicarFiltros, limparFiltros } = useSessoesFilters()
  const { data: sessions = [] } = useSessoes(filters)

  return (
    <PageLayout>
      <Header
        title='Sessões'
        description='Gerencie agendamentos e sessões terapêuticas'
        className='xs:flex-row flex-col xs:items-center justify-between gap-2'
      >
        <button
          onClick={() => openAgendarSessaoModal()}
          className='xs:flex-initial flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2 font-medium text-white hover:bg-green-600'
        >
          <Plus className='h-5 w-5' />
          Nova Sessão
        </button>
      </Header>

      <div className='flex flex-col gap-8'>
        {/* Search and Filters */}
        <SessoesFilters
          filters={filters}
          onAplicarFiltros={aplicarFiltros}
          onLimparFiltros={limparFiltros}
        />
        {/* Summary Cards */}
        <ResumoSessoes />

        <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
          {/* Main Content - Session List */}
          <SessoesListContainer filters={filters} />

          {/* Sidebar Content */}
          <div className='space-y-8'>
            <NextSessions />
            <QuickActions
              onScheduleClick={() => openAgendarSessaoModal()}
              onCalendarClick={() => setIsCalendarModalOpen(true)}
            />
          </div>
        </div>
      </div>

      <ModalCalendarioCompleto
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        sessions={sessions}
      />
    </PageLayout>
  )
}

export default Sessoes
