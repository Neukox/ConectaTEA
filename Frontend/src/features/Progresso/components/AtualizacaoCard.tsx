import { format } from 'date-fns'
import type { ProgressoRecente } from '../types'
import { cn } from '~/lib/utils'

interface AtualizacaoCardProps {
  data: ProgressoRecente
}

export function AtualizacaoCard({ data }: AtualizacaoCardProps) {
  const tituloProfissional = `${data.profissional.titulo} ${data.profissional.nome}`

  const dataAtualizacao = format(data.data, 'dd/MM/yyyy')

  const atualizacao =
    data.diferenca < 0
      ? `-${data.diferenca}%`
      : data.diferenca === 0
        ? `${data.diferenca}%`
        : `+${data.diferenca}%`

  return (
    <div className='rounded-lg border border-gray-100 p-4 transition-shadow hover:shadow-md'>
      <div className='mb-2 flex items-start justify-between'>
        <div className='flex items-center gap-2'>
          <span className='font-bold text-gray-900'>{data.crianca}</span>
          <span className='rounded bg-gray-100 px-2 py-1 text-xs text-gray-600'>
            {data.meta.titulo}
          </span>
        </div>
        <span
          className={cn('text-sm font-bold', {
            'text-green-600': data.diferenca > 0,
            'text-red-600': data.diferenca < 0,
            'text-gray-600': data.diferenca === 0,
          })}
        >
          {atualizacao}
        </span>
      </div>
      <p className='mb-3 text-sm text-gray-600'>{data.descricao}</p>
      <div className='flex items-center justify-between text-xs text-gray-400'>
        <span>Profissional: {tituloProfissional}</span>
        <div className='flex gap-4'>
          <span>Data: {dataAtualizacao}</span>
          <span>Progresso atual: {data.progresso_atual}%</span>
        </div>
      </div>
    </div>
  )
}
