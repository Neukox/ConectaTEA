import { cn } from '~/lib/utils'
import type { DadosCriancasDashboard } from '~/features/Dashboard/types'
import { StatusVinculoProfissionalCriancaMap } from '~/features/Criancas/types'
import { HiOutlineDotsHorizontal } from 'react-icons/hi'

interface DashboardCriancaCardProps {
  crianca: DadosCriancasDashboard & {
    avatar?: string
  }
  onCardClick?: () => void
}

export default function DashboardCriancaCard({
  crianca,
  onCardClick,
}: DashboardCriancaCardProps) {
  return (
    <div
      className='@container relative cursor-pointer items-center justify-between rounded-xl border border-transparent bg-gray-50 px-4 py-3 transition-all duration-200 hover:-translate-y-1 hover:border-green-400 hover:bg-white hover:shadow-md focus:-translate-y-1'
      tabIndex={0}
      onClick={onCardClick}
    >
      <div className='flex flex-1 flex-col items-center gap-4 text-center @sm:flex-row @sm:justify-between @sm:text-start'>
        <div className='flex flex-col items-center gap-3 @sm:flex-row'>
          <img
            src={crianca.avatar}
            alt={crianca.nome}
            className='h-12 w-12 rounded-full border-2 border-white object-cover shadow'
          />
          <div>
            <p className='text-base font-semibold'>{crianca.nome}</p>
            <p className='text-xs text-gray-500'>
              {crianca.idade + ' anos'} · {crianca.diagnostico}
            </p>
            <p className='text-xs text-gray-400'>
              Profissional: {crianca.profissional}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <span
            className={cn(
              'rounded-full px-3 py-1 text-xs font-bold',
              crianca.status === 'AGUARDANDO' && 'bg-gray-200 text-gray-600',
              crianca.status === 'VINCULADO' && 'bg-green-100 text-green-600',
              crianca.status === 'SUSPENSO' && 'bg-yellow-100 text-yellow-600',
              crianca.status === 'DESVINCULADO' && 'bg-red-100 text-red-600',
            )}
          >
            {StatusVinculoProfissionalCriancaMap[crianca.status]}
          </span>
          <button className='absolute top-2 right-2 rounded p-1 hover:bg-gray-200 @sm:relative @sm:top-0 @sm:right-0'>
            <HiOutlineDotsHorizontal className='h-5 w-5 text-gray-600' />
          </button>
        </div>
      </div>
    </div>
  )
}
