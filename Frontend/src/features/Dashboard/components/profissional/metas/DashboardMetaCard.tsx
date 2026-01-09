import { cn } from '~/lib/utils'
import type { DadosMetasDashboard } from '~/features/Dashboard/types'
import { StatusMeta } from '~/features/Metas/types'

export interface DashboardMetaCardProps {
  meta: DadosMetasDashboard
  onCardClick?: () => void
}

export default function DashboardMetaCard({
  meta,
  onCardClick,
}: DashboardMetaCardProps) {
  return (
    <div
      className='@container cursor-pointer rounded-xl border border-transparent bg-gray-50 px-4 py-3 transition-all duration-200 hover:-translate-y-1 hover:border-green-400 hover:bg-white hover:shadow-md focus:-translate-y-1'
      tabIndex={0}
      onClick={onCardClick}
    >
      <div className='mb-2 flex flex-col items-start justify-between gap-4 @sm:flex-row @sm:items-center @sm:justify-between'>
        <div className='space-y-1 @sm:flex-1'>
          <p className='text-base font-semibold'>{meta.crianca}</p>
          <p className='text-xs text-gray-500'>{meta.titulo}</p>
        </div>
        <div className='w-full flex justify-between gap-1 @sm:w-fit @sm:flex-col @sm:items-end '>
          <span
            className={cn(
              'rounded-full px-3 py-1 text-xs font-bold',
              meta.status === 'EM_ANDAMENTO' && 'bg-blue-100 text-blue-600',
              meta.status === 'QUASE_CONCLUIDA' &&
                'bg-green-100 text-green-600',
              meta.status === 'CONCLUIDA' && 'bg-green-200 text-green-800',
              meta.status === 'VENCENDO' && 'bg-yellow-100 text-yellow-600',
            )}
          >
            {StatusMeta[meta.status]}
          </span>
          <p className='text-base font-bold text-green-600'>
            {meta.progresso}%
          </p>
        </div>
      </div>
      <div className='h-3 w-full rounded-full bg-gray-200'>
        <div
          className='h-3 rounded-full bg-green-500 transition-all duration-500'
          style={{ width: `${meta.progresso}%` }}
        ></div>
      </div>
    </div>
  )
}
