import React, { useState } from 'react'
import { type View, Views } from 'react-big-calendar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui'
import type { CalendarEvent } from './FullCalendar'
import FullCalendar from './FullCalendar'
import { TipoSessao, type Sessao } from '../types'

interface ModalCalendarioCompletoProps {
  isOpen: boolean
  onClose: () => void
  sessions: Sessao[]
  onSelectSession?: (session: any) => void
}

const ModalCalendarioCompleto: React.FC<ModalCalendarioCompletoProps> = ({
  isOpen,
  onClose,
  sessions,
  onSelectSession,
}) => {
  const [date, setDate] = useState(new Date(2024, 0, 14)) // Start at mock date
  const [view, setView] = useState<View>(Views.MONTH)

  // Map sessions to calendar events
  const events: CalendarEvent[] = sessions.map((session) => {
    // Logic to construct date/time
    // Fallback date logic since mock data in Sessoes.tsx doesn't have full date strings yet for all items
    // In a real app, session.date would be a full ISO string or Date object.
    const eventDate = session.data ? session.data : new Date(2024, 0, 14)
    const [hours, minutes] = session.data.split('T')[1].split(':').map(Number)
    const startDate = new Date(eventDate)
    startDate.setHours(hours, minutes)

    // quick parse duration "60min" -> 60
    const duration = session.duracao
    const endDate = new Date(startDate)
    endDate.setMinutes(minutes + duration)

    const tipo = TipoSessao[session.tipo]

    // Color logic
    let color = 'bg-green-100 text-green-700'
    if (session.status === 'CONCLUIDA') color = 'bg-blue-100 text-blue-700'
    if (session.status === 'PENDENTE') color = 'bg-purple-100 text-purple-700'
    if (session.status === 'EM_ANDAMENTO')
      color = 'bg-yellow-100 text-yellow-700'
    if (session.status === 'CANCELADA') color = 'bg-orange-100 text-orange-700'

    return {
      id: String(session.id),
      title: `${session.crianca.nome} - ${tipo}`,
      start: startDate,
      end: endDate,
      color,
      resource: session,
    }
  })

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent className='flex max-h-[80vh] w-[90vw] max-w-5xl flex-col overflow-hidden'>
        <DialogHeader>
          <DialogTitle>Calendário Completo</DialogTitle>
        </DialogHeader>
        <div className='flex flex-1 flex-col overflow-hidden'>
          <FullCalendar
            events={events}
            date={date}
            onNavigate={setDate}
            view={view}
            onView={setView}
            onSelectEvent={(event) => {
              if (onSelectSession) onSelectSession(event.resource)
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ModalCalendarioCompleto
