import { format, getDay, parse, startOfWeek } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import React from 'react'
import {
  Calendar,
  dateFnsLocalizer,
  type View,
  Views,
} from 'react-big-calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import type { Sessao } from '../types'

// Setup localizer
const locales = {
  'pt-BR': ptBR,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource?: Sessao
}

interface FullCalendarProps {
  events: CalendarEvent[]
  date?: Date
  onNavigate?: (date: Date) => void
  onView?: (view: View) => void
  view?: View
  onSelectEvent?: (event: CalendarEvent) => void
}

const CustomToolbar = (toolbar: any) => {
  const goToBack = () => {
    toolbar.onNavigate('PREV')
  }

  const goToNext = () => {
    toolbar.onNavigate('NEXT')
  }

  const goToCurrent = () => {
    toolbar.onNavigate('TODAY')
  }

  const label = () => {
    const date = toolbar.date
    return (
      <span className='text-lg font-bold text-gray-800 capitalize'>
        {format(date, 'MMMM yyyy', { locale: ptBR })}
      </span>
    )
  }

  return (
    <div className='mb-4 flex items-center justify-between p-2'>
      <div className='flex items-center gap-4'>
        {label()}
        <div className='flex gap-1'>
          <button
            onClick={goToBack}
            className='rounded-full p-1 transition-colors hover:bg-gray-100'
          >
            <ChevronLeft className='h-5 w-5 text-gray-600' />
          </button>
          <button
            onClick={goToCurrent}
            className='rounded-md px-3 py-1 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100'
          >
            Hoje
          </button>
          <button
            onClick={goToNext}
            className='rounded-full p-1 transition-colors hover:bg-gray-100'
          >
            <ChevronRight className='h-5 w-5 text-gray-600' />
          </button>
        </div>
      </div>

      <div className='flex rounded-lg bg-gray-100 p-1'>
        {['month', 'week', 'day'].map((view) => (
          <button
            key={view}
            onClick={() => toolbar.onView(view)}
            className={`rounded-md px-3 py-1 text-sm font-medium transition-all ${
              toolbar.view === view
                ? 'border-primary border bg-white text-green-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            } `}
          >
            {view === 'month' && 'Mês'}
            {view === 'week' && 'Semana'}
            {view === 'day' && 'Dia'}
          </button>
        ))}
      </div>
    </div>
  )
}

const FullCalendar: React.FC<FullCalendarProps> = ({
  events,
  date,
  onNavigate,
  onView,
  view = Views.MONTH,
  onSelectEvent,
}) => {
  return (
    <div className='h-[60vh] w-full rounded-xl bg-white'>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor='start'
        endAccessor='end'
        culture='pt-BR'
        messages={{
          next: 'Próximo',
          previous: 'Anterior',
          today: 'Hoje',
          month: 'Mês',
          week: 'Semana',
          day: 'Dia',
          agenda: 'Agenda',
          date: 'Data',
          time: 'Hora',
          event: 'Evento',
          noEventsInRange: 'Não há eventos neste período.',
          showMore: (events) => `Mais ${events}...`,
        }}
        components={{
          toolbar: CustomToolbar,
        }}
        date={date}
        onNavigate={onNavigate}
        view={view}
        onView={onView}
        onSelectEvent={onSelectEvent}
        eventPropGetter={(event) => {
          let className =
            'bg-green-100 text-green-700 border-l-4 border-green-500'
          if (event.resource?.status === 'CONCLUIDA') {
            className = 'bg-blue-100 text-blue-700 border-l-4 border-blue-500'
          } else if (event.resource?.status === 'PENDENTE') {
            className =
              'bg-yellow-100 text-yellow-700 border-l-4 border-yellow-500'
          }

          return {
            className: `${className} text-xs font-medium px-2 py-1 rounded-r-md border-0`,
          }
        }}
        onShowMore={(events, date) => {
          if (onView) onView(Views.DAY)
          if (onNavigate) onNavigate(date)
        }}
      />
    </div>
  )
}

export default FullCalendar
