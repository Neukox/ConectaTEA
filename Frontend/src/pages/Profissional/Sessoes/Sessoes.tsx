import React, { useState } from 'react'
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  FileText,
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import SummaryCard from './components/SummaryCard'
import SessionItem from './components/SessionItem'
import NextSessions from './components/NextSessions'
import QuickActions from './components/QuickActions'
import PageLayout from '~/layouts/PageLayout'
import Header from '~/components/Header'


const Sessoes: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>('14/01/2024')

  // Mock data
  const summaryData = [
    {
      icon: CalendarIcon,
      count: 12,
      label: 'Hoje',
      color: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      icon: Clock,
      count: 8,
      label: 'Concluídas',
      color: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      icon: User,
      count: 18,
      label: 'Esta Semana',
      color: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
    {
      icon: FileText,
      count: 2,
      label: 'Pendentes',
      color: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
  ]

  const sessions = [
    {
      id: '1',
      time: '09:00',
      duration: '60min',
      patientName: 'Ana Silva',
      status: 'Agendada' as const,
      type: 'Terapia Individual',
      description: 'Sessão focada em comunicação verbal e interação social',
      professionalName: 'Dr. João Santos',
    },
    {
      id: '2',
      time: '10:30',
      duration: '45min',
      patientName: 'Pedro Costa',
      status: 'Concluída' as const,
      type: 'Fonoaudiologia',
      description: 'Exercícios de articulação e desenvolvimento da fala',
      observation: 'Boa evolução na pronúncia de fonemas complexos',
      professionalName: 'Dra. Ana Lima',
    },
    {
      id: '3',
      time: '14:00',
      duration: '60min',
      patientName: 'Sofia Oliveira',
      status: 'Em Andamento' as const,
      type: 'Terapia Ocupacional',
      description: 'Atividades de coordenação motora fina',
      professionalName: 'Dr. Roberto Silva',
    },
  ]

  const nextSessions = [
    {
      id: '1',
      time: '09:30',
      date: '15/01',
      patientName: 'Ana Silva',
      professionalName: 'Dr. João Santos',
      type: 'Terapia Individual',
    },
    {
      id: '2',
      time: '11:00',
      date: '15/01',
      patientName: 'Carlos Mendes',
      professionalName: 'Dra. Ana Lima',
      type: 'Avaliação',
    },
  ]

  return (
    <PageLayout>
      <Header
        title='Sessões'
        description='Gerencie agendamentos e sessões terapêuticas'
      >
        <button className='flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 font-medium text-white hover:bg-green-600'>
          <Plus className='h-5 w-5' />
          Nova Sessão
        </button>
      </Header>

      {/* Search and Filters */}
      <div className='mb-8 flex flex-col gap-4 md:flex-row'>
        <div className='relative flex-1'>
          <Search className='absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400' />
          <input
            type='text'
            placeholder='Buscar sessões...'
            className='w-full rounded-lg border border-gray-200 py-2 pr-4 pl-10 focus:border-green-500 focus:outline-none'
          />
        </div>
        <div className='flex gap-2'>
          <select className='rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-700 focus:border-green-500 focus:outline-none'>
            <option>Dia</option>
            <option>Semana</option>
            <option>Mês</option>
          </select>
          <button className='flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50'>
            <Filter className='h-5 w-5' />
            Filtros
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className='mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
        {summaryData.map((data, index) => (
          <SummaryCard
            key={index}
            {...data}
          />
        ))}
      </div>

      <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
        {/* Main Content - Session List */}
        <div className='lg:col-span-2'>
          <div className='mb-6 flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm'>
            <div className='flex items-center gap-2'>
              <CalendarIcon className='h-5 w-5 text-gray-600' />
              <span className='font-bold text-gray-800'>
                Sessões de {selectedDate}
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
                {...session}
              />
            ))}
          </div>
        </div>

        {/* Sidebar Content */}
        <div className='space-y-8'>
          <NextSessions sessions={nextSessions} />
          <QuickActions />
        </div>
      </div>
    </PageLayout>
  )
}

export default Sessoes
