import { useNavigate } from 'react-router-dom'
import { TrendingUp, Eye, Pencil } from 'lucide-react'
import type { Meta } from '../../Meta.types'
import { Badge } from './Badge'
import { OutlineButton } from './OutlineButton'
import { ProgressBar } from './ProgressBar'

interface MetaCardProps {
  meta: Meta
  onEdit: (meta: Meta) => void
  onUpdateProgress: (meta: Meta) => void
}

export function MetaCard({ meta, onEdit, onUpdateProgress }: MetaCardProps) {
  const navigate = useNavigate()
  let prioridadeTone: 'default' | 'success' | 'warning' | 'danger' = 'default'
  if (meta.prioridade === 'alta') prioridadeTone = 'danger'
  else if (meta.prioridade === 'media') prioridadeTone = 'warning'
  else prioridadeTone = 'default'

  return (
    <div className='rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md'>
      <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div className='flex items-center gap-4'>
          <img
            src={meta.crianca.avatarUrl}
            alt={meta.crianca.nome}
            className='h-12 w-12 rounded-full border'
          />
          <div>
            <div className='text-lg font-semibold text-green-800'>
              {meta.titulo}
            </div>
            <div className='text-xs text-gray-500'>
              {meta.categoria} • {meta.status}
            </div>
            <div className='mt-1 flex items-center gap-2'>
              <span className='text-xs text-gray-400'>
                Período: {meta.periodo}
              </span>
            </div>
          </div>
        </div>
        <div className='flex flex-wrap items-center gap-2 md:justify-end'>
          <OutlineButton
            icon={Eye}
            onClick={() => navigate(`/profissional/metas/detalhes/${meta.id}`)}
          >
            Ver Detalhes
          </OutlineButton>
          <OutlineButton
            icon={TrendingUp}
            onClick={() => onUpdateProgress(meta)}
          >
            Atualizar Progresso
          </OutlineButton>
          <OutlineButton
            icon={Pencil}
            onClick={() => onEdit(meta)}
          >
            Editar
          </OutlineButton>
        </div>
      </div>
      <div className='mt-6'>
        <div className='mb-2 text-sm font-semibold text-gray-700'>
          Progresso
        </div>
        <ProgressBar value={meta.progresso} />
      </div>
      <div className='mt-4 flex flex-wrap items-center gap-2'>
        <button className='rounded-md border border-green-300 px-3 py-1 text-xs font-medium text-green-800 hover:bg-green-50'>
          +5%
        </button>
        <button className='rounded-md border border-green-300 px-3 py-1 text-xs font-medium text-green-800 hover:bg-green-50'>
          +10%
        </button>
        <Badge tone={prioridadeTone}>Prioridade {meta.prioridade}</Badge>
      </div>
    </div>
  )
}
