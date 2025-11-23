import React from 'react'

interface SessionItemProps {
  time: string
  duration?: string
  patientName: string
  status: 'Agendada' | 'Concluída' | 'Em Andamento' | 'Cancelada'
  type: string
  description?: string
  observation?: string
  professionalName: string
  date?: string // For next sessions list if needed, though main list is usually by day
}

const SessionItem: React.FC<SessionItemProps> = ({
  time,
  duration,
  patientName,
  status,
  type,
  description,
  observation,
  professionalName,
}) => {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Agendada':
        return 'bg-blue-100 text-blue-700'
      case 'Concluída':
        return 'bg-green-100 text-green-700'
      case 'Em Andamento':
        return 'bg-yellow-100 text-yellow-700'
      case 'Cancelada':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'Terapia Individual':
        return 'bg-indigo-100 text-indigo-700'
      case 'Fonoaudiologia':
        return 'bg-purple-100 text-purple-700'
      case 'Terapia Ocupacional':
        return 'bg-orange-100 text-orange-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className='mb-4 rounded-xl border bg-white p-6 shadow-sm'>
      <div className='flex flex-col gap-4 md:flex-row md:items-start md:justify-between'>
        <div className='flex gap-6'>
          <div className='flex flex-col items-center'>
            <span className='text-lg font-bold text-gray-800'>{time}</span>
            {duration && (
              <span className='text-xs text-gray-500'>{duration}</span>
            )}
          </div>

          <div className='space-y-2'>
            <div className='flex flex-wrap items-center gap-3'>
              <h3 className='text-lg font-bold text-gray-800'>{patientName}</h3>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(status)}`}
              >
                {status}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${getTypeStyle(type)}`}
              >
                {type}
              </span>
            </div>

            {description && <p className='text-gray-600'>{description}</p>}

            {observation && (
              <div className='mt-2 rounded-lg bg-blue-50 p-3 text-sm text-gray-700'>
                <span className='font-semibold'>Observações: </span>
                {observation}
              </div>
            )}

            <div className='flex items-center gap-2 text-sm text-gray-500'>
              <span>Profissional: {professionalName}</span>
            </div>
          </div>
        </div>

        <div className='flex gap-2'>
          <button className='rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50'>
            Editar
          </button>
          {status === 'Agendada' && (
            <button className='rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50'>
              Iniciar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default SessionItem
