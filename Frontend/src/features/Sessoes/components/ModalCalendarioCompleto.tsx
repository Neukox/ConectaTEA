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
import { parseSessionDateString } from '../utils'
import useSessoesModal from '../hooks/useSessoesModal'
import { format } from 'date-fns'

interface ModalCalendarioCompletoProps {
  isOpen: boolean
  onClose: () => void
  sessions: Sessao[]
}

const ModalCalendarioCompleto: React.FC<ModalCalendarioCompletoProps> = ({
  isOpen,
  onClose,
  sessions,
}) => {
  const [date, setDate] = useState(new Date())
  const [view, setView] = useState<View>(Views.MONTH)

  const { openEditarSessaoModal } = useSessoesModal()

  // Map sessions to calendar events
  const events: CalendarEvent[] = sessions.map((session) => {
    const startDate = parseSessionDateString(session.dataHora)

    // quick parse duration "60min" -> 60
    const duration = session.duracao
    const endDate = new Date(startDate)
    endDate.setMinutes(endDate.getMinutes() + duration)

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
      title: `Criança #${session.criancaId} - ${tipo}`,
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
              const parsedDate = parseSessionDateString(event.resource?.dataHora as string)

              openEditarSessaoModal({
                id: event.resource?.id as number,
                data: format(
                  parsedDate,
                  'yyyy-MM-dd',
                ),
                horario: format(
                  parsedDate,
                  'HH:mm',
                ),
                descricao: event.resource?.descricao as string,
                duracao: event.resource?.duracao as number,
                observacoes: event.resource?.observacoes as string,
                tipoSessao: event.resource?.tipo as TipoSessao,
              })
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ModalCalendarioCompleto
