import React from 'react'
import { Plus, Calendar, FileText } from 'lucide-react'

interface QuickActionsProps {
  onScheduleClick?: () => void
  onCalendarClick?: () => void
}

const QuickActions: React.FC<QuickActionsProps> = ({
  onScheduleClick,
  onCalendarClick,
}) => {
  return (
    <div className='rounded-xl border bg-white p-6 shadow-sm'>
      <h3 className='mb-4 text-lg font-bold text-gray-800'>Ações Rápidas</h3>
      <div className='space-y-3'>
        <button
          onClick={onScheduleClick}
          className='flex w-full items-center gap-3 rounded-lg border border-gray-200 p-3 text-left hover:bg-gray-50'
        >
          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gray-100'>
            <Plus className='h-4 w-4 text-gray-600' />
          </div>
          <span className='font-medium text-gray-700'>Agendar Sessão</span>
        </button>

        <button
          onClick={onCalendarClick}
          className='flex w-full items-center gap-3 rounded-lg border border-gray-200 p-3 text-left hover:bg-gray-50'
        >
          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gray-100'>
            <Calendar className='h-4 w-4 text-gray-600' />
          </div>
          <span className='font-medium text-gray-700'>
            Ver Calendário Completo
          </span>
        </button>

        <button className='flex w-full items-center gap-3 rounded-lg border border-gray-200 p-3 text-left hover:bg-gray-50'>
          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gray-100'>
            <FileText className='h-4 w-4 text-gray-600' />
          </div>
          <span className='font-medium text-gray-700'>
            Relatório de Sessões
          </span>
        </button>
      </div>
    </div>
  )
}

export default QuickActions
