import React, { useMemo } from 'react'
import { TipoSessao, type Sessao } from '../types'
import { format } from 'date-fns'
import useSessoes from '../hooks/useSessoes'
import NotFoundData from '~/components/common/NotFoundData'
import { LuCalendar } from 'react-icons/lu'
import NextSessionsLoading from './NextSessionLoading'
import { parseSessionDateString } from '../utils'

interface NextSessionsProps {
  sessions?: Sessao[]
}

const NextSessions: React.FC<NextSessionsProps> = () => {
  const { data, isLoading } = useSessoes()

  const sessions = useMemo(() => {
    if (isLoading || !data) return []
    const nextSessions = data
      .filter((session) => {
        const parsedDate = parseSessionDateString(session.data)

        return session.status === 'AGENDADA' && parsedDate >= new Date()
      })
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
      .slice(0, 3)

    return nextSessions
  }, [data, isLoading])

  const formattedData = sessions.map((session) => ({
    ...session,
    data: parseSessionDateString(session.data),
  }))

  return (
    <div className='rounded-xl border bg-white p-6 shadow-sm'>
      <h3 className='mb-4 text-lg font-bold text-gray-800'>Próximas Sessões</h3>
      <div className='space-y-4'>
        {sessions &&
          formattedData.map((session) => (
            <div
              key={session.id}
              className='flex items-start gap-4 rounded-lg border border-gray-100 p-3'
            >
              <div className='flex flex-col items-center justify-center rounded-lg bg-gray-50 px-3 py-2 text-center'>
                <span className='text-sm font-bold text-gray-800'>
                  {format(session.data, 'HH:mm')}
                </span>
                <span className='text-xs text-gray-500'>
                  {format(session.data, 'dd/MM')}
                </span>
              </div>
              <div>
                <h4 className='font-bold text-gray-800'>
                  {session.crianca.nome}
                </h4>
                <p className='text-xs text-gray-500'>
                  {session.profissional.nome}
                </p>
                <span className='mt-1 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600'>
                  {TipoSessao[session.tipo]}
                </span>
              </div>
            </div>
          ))}
        {sessions.length === 0 && (
          <NotFoundData
            title='Nenhuma sessão próxima'
            subtitle='Verifique as próximas datas para agendar uma sessão.'
            icon={LuCalendar}
          />
        )}
        {isLoading && <NextSessionsLoading />}
      </div>
    </div>
  )
}

export default NextSessions
