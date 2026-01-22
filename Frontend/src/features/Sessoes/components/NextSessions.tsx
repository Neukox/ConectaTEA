import React from 'react'
import { TipoSessao, type Sessao } from '../types'
import { format } from 'date-fns'

interface NextSessionsProps {
  sessions: Sessao[]
}

const NextSessions: React.FC<NextSessionsProps> = ({ sessions }) => {
  return (
    <div className='rounded-xl border bg-white p-6 shadow-sm'>
      <h3 className='mb-4 text-lg font-bold text-gray-800'>Próximas Sessões</h3>
      <div className='space-y-4'>
        {sessions.map((session) => (
          <div
            key={session.id}
            className='flex items-start gap-4 rounded-lg border border-gray-100 p-3'
          >
            <div className='flex flex-col items-center justify-center rounded-lg bg-gray-50 px-3 py-2 text-center'>
              <span className='text-sm font-bold text-gray-800'>
                {format(new Date(session.data), 'HH:mm')}
              </span>
              <span className='text-xs text-gray-500'>
                {format(new Date(session.data), 'dd/MM')}
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
      </div>
    </div>
  )
}

export default NextSessions
