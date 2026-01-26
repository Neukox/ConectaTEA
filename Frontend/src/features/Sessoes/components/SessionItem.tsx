import React from 'react'
import { StatusSessao, TipoSessao, type Sessao } from '../types'
import { format } from 'date-fns'
import { Badge } from '~/components/ui/badge'
import { STATUS_SESSAO_BADGE, TIPO_SESSAO_BADGE } from '../constants'
import { cn } from '~/lib/utils'
import useSessoesModal from '../hooks/useSessoesModal'
import { ptBR } from 'date-fns/locale'

interface SessionItemProps {
  sessao: Sessao
}

const SessionItem: React.FC<SessionItemProps> = ({ sessao }) => {
  const { openEditarSessaoModal } = useSessoesModal()
  // Badges
  const bagdeTipo = TIPO_SESSAO_BADGE[sessao.tipo]
  const bagdeStatus = STATUS_SESSAO_BADGE[sessao.status]

  // Status and Type string values
  const status = StatusSessao[sessao.status]
  const tipo = TipoSessao[sessao.tipo]

  const handleEditClick = () => {
    openEditarSessaoModal({
      id: sessao.id,
      data: format(sessao.data, 'yyyy-MM-dd', { locale: ptBR }),
      horario: format(sessao.data, 'HH:mm', { locale: ptBR }),
      descricao: sessao.descricao,
      duracao: sessao.duracao,
      observacoes: sessao.observacoes,
      tipoSessao: sessao.tipo,
    })
  }

  return (
    <div className='@container mb-4 rounded-xl border bg-white p-6 shadow-sm'>
      <div className='flex flex-col gap-4 @xs:flex-row @xs:items-start @xs:justify-between'>
        <div className='flex gap-6'>
          <div className='flex flex-col items-center'>
            <span className='text-lg font-bold text-gray-800'>
              {format(new Date(sessao.data), 'HH:mm')}
            </span>
            {sessao.duracao && (
              <span className='text-xs text-gray-500'>
                {sessao.duracao} min
              </span>
            )}
          </div>

          <div className='space-y-2'>
            <div className='flex flex-wrap items-center gap-3'>
              <h3 className='text-lg font-bold text-gray-800'>
                {sessao.crianca.nome}
              </h3>
              <Badge className={cn('font-medium', bagdeStatus)}>{status}</Badge>
              <Badge className={cn('font-medium', bagdeTipo)}>{tipo}</Badge>
            </div>
            <p className='text-gray-600'>{sessao.descricao}</p>

            {sessao.observacoes && (
              <div className='mt-2 rounded-lg bg-blue-50 p-3 text-sm text-gray-700'>
                <span className='font-semibold'>Observações: </span>
                {sessao.observacoes}
              </div>
            )}

            <div className='flex items-center gap-2 text-sm text-gray-500'>
              <span>Profissional: {sessao.profissional.nome}</span>
            </div>
          </div>
        </div>

        <div className='flex justify-end gap-2 @xs:flex-col @md:flex-row'>
          <button
            onClick={handleEditClick}
            className='rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50'
          >
            Editar
          </button>
          {sessao.status === 'AGENDADA' && (
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
