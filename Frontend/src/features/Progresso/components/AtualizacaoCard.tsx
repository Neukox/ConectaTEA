import { format, parseISO } from 'date-fns'
import type { ProgressoRecente } from '../types'
import { cn } from '~/lib/utils'
import useCriancas from '~/features/Criancas/hooks/useCriancas'

interface AtualizacaoCardProps {
  data: ProgressoRecente
}

export function AtualizacaoCard({ data }: AtualizacaoCardProps) {
  const { data: criancas } = useCriancas()
  const nomeCrianca = criancas?.items.find(({ id }) => id === data.criancaId)?.nome
  const dataAtualizacao = format(parseISO(data.data), 'dd/MM/yyyy')

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
          <span className='font-bold text-gray-900'>{nomeCrianca ?? `Criança #${data.criancaId}`}</span>
          <span className='rounded bg-gray-100 px-2 py-1 text-xs text-gray-600'>
            {data.metaTitulo}
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
        <div className='flex gap-4'>
          <span>Data: {dataAtualizacao}</span>
          <span>Progresso atual: {data.progressoAtual}%</span>
        </div>
      </div>
    </div>
  )
}
