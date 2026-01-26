import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { ResumoSessoes, SessoesFilters } from '~/features/Sessoes'
import NextSessions from '../../../features/Sessoes/components/NextSessions'
import QuickActions from '../../../features/Sessoes/components/QuickActions'
import ModalCalendarioCompleto from '../../../features/Sessoes/components/ModalCalendarioCompleto'
import { PageLayout } from '~/components/layout/PageLayout'
import Header from '~/components/layout/Header'
import useSessoesModal from '~/features/Sessoes/hooks/useSessoesModal'
import { nextSessions, sessions } from '~/features/Sessoes/mock'
import { SessoesListContainer } from '~/features/Sessoes/components/SessoesListContainer'
import useSessoesFilters from '~/features/Sessoes/hooks/useSessoesFilters'

const Sessoes: React.FC = () => {
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false)

  const { openAgendarSessaoModal } = useSessoesModal()

  const { filters, aplicarFiltros, limparFiltros } = useSessoesFilters()

  return (
    <PageLayout>
      <Header
        title='Sessões'
        description='Gerencie agendamentos e sessões terapêuticas'
      >
        <button
          onClick={() => openAgendarSessaoModal()}
          className='flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 font-medium text-white hover:bg-green-600'
        >
          <Plus className='h-5 w-5' />
          Nova Sessão
        </button>
      </Header>

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
          <NextSessions sessions={nextSessions} />
          <QuickActions
            onScheduleClick={() => openAgendarSessaoModal()}
            onCalendarClick={() => setIsCalendarModalOpen(true)}
          />
        </div>
      </div>

      <ModalCalendarioCompleto
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        sessions={sessions} // Pass the list of sessions
      />
    </PageLayout>
  )
}

export default Sessoes
