import { ptBR } from 'date-fns/locale'
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import SessionItem from './SessionItem'
import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { Button } from '~/components/ui'
import NotFoundData from '~/components/common/NotFoundData'
import type { Sessao } from '../types'
import { parseSessionDateString } from '../utils'

interface SessoesListProps {
  sessoes: Sessao[]
}

export function SessoesList({ sessoes }: SessoesListProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  useEffect(() => {
    const possibleDates = sessoes
      .map((s) => {
        const date = parseSessionDateString(s.data)
        return new Date(date.getFullYear(), date.getMonth(), date.getDate())
      })
      .sort((a, b) => a.getTime() - b.getTime())

    const today = new Date()
    const todayDateOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    )

    const todayInSessions = possibleDates.find(
      (d) => d.getTime() === todayDateOnly.getTime(),
    )

    if (todayInSessions) {
      setSelectedDate(todayDateOnly)
    } else if (possibleDates.length > 0) {
      setSelectedDate(possibleDates[0])
    }
  }, [sessoes])

  const filteredSessoes = useMemo(() => {
    if (!selectedDate) return []

    return sessoes.filter((s) => {
      const sessionDate = parseSessionDateString(s.data)
      const sessionDateOnly = new Date(
        sessionDate.getFullYear(),
        sessionDate.getMonth(),
        sessionDate.getDate(),
      )

      return sessionDateOnly.getTime() === selectedDate.getTime()
    })
  }, [sessoes, selectedDate])

  const handlePreviousDate = () => {
    const previousDate = new Date(selectedDate)
    previousDate.setDate(previousDate.getDate() - 1)
    setSelectedDate(previousDate)
  }

  const handleNextDate = () => {
    const nextDate = new Date(selectedDate)
    nextDate.setDate(nextDate.getDate() + 1)
    setSelectedDate(nextDate)
  }

  return (
    <div className='@container lg:col-span-2'>
      <div className='mb-6 flex flex-col items-center gap-4 rounded-xl border bg-white p-4 shadow-sm @md:flex-row @md:justify-between'>
        <div className='flex items-center gap-2'>
          <CalendarIcon className='h-5 w-5 text-gray-600' />
          <span className='font-bold text-gray-800'>
            Sessões de {format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })}
          </span>
        </div>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            className=''
            onClick={handlePreviousDate}
          >
            <ChevronLeft className='h-5 w-5 text-gray-600' />
          </Button>
          <Button
            variant='outline'
            className=''
            onClick={() => setSelectedDate(new Date())}
          >
            Hoje
          </Button>
          <Button
            variant='outline'
            className=''
            onClick={handleNextDate}
          >
            <ChevronRight className='h-5 w-5 text-gray-600' />
          </Button>
        </div>
      </div>

      <div className='space-y-4'>
        {filteredSessoes &&
          filteredSessoes.map((session) => (
            <SessionItem
              key={session.id}
              sessao={session}
            />
          ))}
        {filteredSessoes.length === 0 && (
          <NotFoundData
            title='Nenhuma sessão encontrada'
            subtitle='Nenhuma sessão encontrada para esta data.'
            icon={CalendarIcon}
            className='min-h-100'
          />
        )}
      </div>
    </div>
  )
}
