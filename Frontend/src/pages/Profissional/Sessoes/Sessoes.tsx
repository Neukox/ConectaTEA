import React, { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { ResumoSessoes, SessoesFilters } from '~/features/Sessoes'
import SessionItem from '../../../features/Sessoes/components/SessionItem'
import NextSessions from '../../../features/Sessoes/components/NextSessions'
import QuickActions from '../../../features/Sessoes/components/QuickActions'
import ModalCalendarioCompleto from '../../../features/Sessoes/components/ModalCalendarioCompleto'
import ModalEditarSessao from '../../../features/Sessoes/components/ModalEditarSessao'
import { PageLayout } from '~/components/layout/PageLayout'
import Header from '~/components/layout/Header'
import useSessoesModal from '~/features/Sessoes/hooks/useSessoesModal'
import { nextSessions, sessions } from '~/features/Sessoes/mock'

const Sessoes: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2024, 0, 14))
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<any>(null)

  const { openAgendarSessaoModal } = useSessoesModal()

  const handleEditSession = (data: any) => {
    console.log('Sessão editada:', data)
    // API call to update session
    setEditingSession(null)
  }

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
      <SessoesFilters />

      {/* Summary Cards */}
      <ResumoSessoes />

      <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
        {/* Main Content - Session List */}
        <div className='lg:col-span-2'>
          <div className='mb-6 flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm'>
            <div className='flex items-center gap-2'>
              <CalendarIcon className='h-5 w-5 text-gray-600' />
              <span className='font-bold text-gray-800'>
                Sessões de{' '}
                {format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })}
              </span>
            </div>
            <div className='flex gap-2'>
              <button className='rounded-lg border border-gray-200 p-1 hover:bg-gray-50'>
                <ChevronLeft className='h-5 w-5 text-gray-600' />
              </button>
              <button className='rounded-lg border border-gray-200 px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-50'>
                Hoje
              </button>
              <button className='rounded-lg border border-gray-200 p-1 hover:bg-gray-50'>
                <ChevronRight className='h-5 w-5 text-gray-600' />
              </button>
            </div>
          </div>

          <div className='space-y-4'>
            {sessions.map((session) => (
              <SessionItem
                key={session.id}
                sessao={session}
                onEdit={() => setEditingSession(session)}
              />
            ))}
          </div>
        </div>

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
        onSelectSession={(session) => {
          // Optional: Handle selection, e.g., jump to that date in the main view
          if (session) {
            setEditingSession(session)
            // Optional: Close calendar if desired, or keep open
            // setIsCalendarModalOpen(false)
          }
        }}
      />

      {editingSession && (
        <ModalEditarSessao
          isOpen={!!editingSession}
          onClose={() => setEditingSession(null)}
          session={editingSession}
          onSave={handleEditSession}
        />
      )}
    </PageLayout>
  )
}

export default Sessoes
