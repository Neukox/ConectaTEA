import { useNavigate } from 'react-router-dom'
import { TrendingUp, Eye, Pencil } from 'lucide-react'
import {
  CategoriaMeta,
  PrioridadeMeta,
  StatusMeta,
  type Meta,
  type MetasInfo,
} from '../types'
import { Badge } from './Badge'
import { OutlineButton } from './OutlineButton'
import { ProgressBar } from './ProgressBar'
import { format } from 'date-fns'

interface MetaCardProps {
  meta: MetasInfo
  onEdit: (meta: Meta) => void
  onUpdateProgress: (meta: Meta) => void
}

// Função para gerar URL de avatar baseada no nome
// TODO: substituir por dados reais no backend quando for implementado. Por enquanto, usamos um gerador de avatares.
const buildAvatarUrl = (nome: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=random`

export function MetaCard({ meta, onEdit, onUpdateProgress }: MetaCardProps) {
  const navigate = useNavigate()
  let prioridadeTone: 'default' | 'success' | 'warning' | 'danger' = 'default'
  if (meta.prioridade === 'ALTA') prioridadeTone = 'danger'
  else if (meta.prioridade === 'MEDIA') prioridadeTone = 'warning'
  else prioridadeTone = 'default'

  const dataInicio = format(meta.data_inicio, 'dd/MM/yyyy')
  const dataFim = format(meta.data_fim, 'dd/MM/yyyy')

  const avatarUrl = buildAvatarUrl(meta.crianca.nome)

  const progressUpdates: string[] = meta.updates.map((value) => {
    if (value < 0) {
      return `-${value}%`
    }

    return `+${value}%`
  })

  return (
    <div className='rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md'>
      <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div className='flex items-center gap-4'>
          <img
            src={avatarUrl}
            alt={meta.crianca.nome}
            className='h-12 w-12 rounded-full border'
          />
          <div>
            <div className='text-lg font-semibold text-green-800'>
              {meta.titulo}
            </div>
            <div className='text-xs text-gray-500'>
              {CategoriaMeta[meta.categoria]} • {StatusMeta[meta.status]}
            </div>
            <div className='mt-1 flex items-center gap-2'>
              <span className='text-xs text-gray-400'>
                Período: {`${dataInicio} - ${dataFim}`}
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
        {progressUpdates.map((update, index) => (
          <Badge
            key={index}
            tone={update.startsWith('+') ? 'success' : 'danger'}
          >
            {update}
          </Badge>
        ))}
        <Badge tone={prioridadeTone}>
          Prioridade {PrioridadeMeta[meta.prioridade]}
        </Badge>
      </div>
    </div>
  )
}
