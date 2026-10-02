import { useNavigate } from 'react-router-dom'
import { TrendingUp, Eye, Pencil } from 'lucide-react'
import {
  CategoriaMeta,
  PrioridadeMeta,
  StatusMeta,
  type Meta,
  type MetasInfo,
} from '../types'
import { Badge } from '~/components/ui/badge'
import { OutlineButton } from './OutlineButton'
import { ProgressBar } from '~/components/common/ProgressBar'
import { format, parseISO } from 'date-fns'
import { useMetasModal } from '../hooks/useMetasModal'
import useCriancas from '~/features/Criancas/hooks/useCriancas'

interface MetaCardProps {
  meta: MetasInfo
}

export function MetaCard({ meta }: MetaCardProps) {
  const navigate = useNavigate()
  const { openAtualizarMetaModal, openAtualizarProgressoModal } =
    useMetasModal()

  let prioridadeTone: 'default' | 'success' | 'warning' | 'danger' = 'default'
  if (meta.prioridade === 'ALTA') prioridadeTone = 'danger'
  else if (meta.prioridade === 'MEDIA') prioridadeTone = 'warning'
  else prioridadeTone = 'success'

  const { data: criancas } = useCriancas()
  const nomeCrianca = criancas?.items.find(({ id }) => id === meta.criancaId)?.nome
  const dataInicio = format(parseISO(meta.dataInicio), 'dd/MM/yyyy')
  const dataFim = format(parseISO(meta.dataFim), 'dd/MM/yyyy')

  const onEdit = (meta: Meta) => {
    openAtualizarMetaModal({
      id: meta.id,
      titulo: meta.titulo,
      categoria: meta.categoria,
      prioridade: meta.prioridade,
      dataInicio: meta.dataInicio,
      dataFim: meta.dataFim,
      descricao: meta.descricao || '',
    })
  }

  const onUpdateProgress = (meta: Meta) => {
    openAtualizarProgressoModal({
      id: meta.id,
      titulo: meta.titulo,
      progresso: meta.progresso,
    })
  }

  return (
    <div className='rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md'>
      <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div className='flex items-center gap-4'>
          <div>
            <div className='text-lg font-semibold text-green-800'>
              {meta.titulo}
            </div>
            <div className='text-xs text-gray-500'>
              {CategoriaMeta[meta.categoria]} • {StatusMeta[meta.status]}
            </div>
            <div className='text-xs text-gray-500'>
              {nomeCrianca ?? `Criança #${meta.criancaId}`}
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
        <ProgressBar value={meta.progresso}>
          <div className='mb-2 flex justify-between text-right text-sm font-bold'>
            <span>Progreso</span>
            <span className='text-green-800'>{meta.progresso}%</span>
          </div>
        </ProgressBar>
      </div>
      <div className='mt-4 flex flex-wrap items-center gap-2'>
        <Badge
          variant='outline'
          tone={prioridadeTone}
          className='font-medium'
        >
          Prioridade {PrioridadeMeta[meta.prioridade]}
        </Badge>
      </div>
    </div>
  )
}
