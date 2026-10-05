import { LockKeyhole, Pencil, Trash2, Users } from 'lucide-react'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import type { Anotacao, PapelAnotacoes } from '../types'
import { AiAnnotationAssistantTrigger } from './AiAnnotationAssistantTrigger'

type Props = {
  anotacao: Anotacao
  papel: PapelAnotacoes
  onEdit?: (anotacao: Anotacao) => void
  onDelete?: (anotacao: Anotacao) => void
  onOpenAi: (annotationId: number) => void
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function AnotacaoCard({
  anotacao,
  papel,
  onEdit,
  onDelete,
  onOpenAi,
}: Props) {
  const isPrivate = anotacao.visibilidade === 'PRIVADA'
  const podeGerenciar = papel === 'PROFISSIONAL' && anotacao.isAutor

  return (
    <article className='annotation-card group col-span-12 flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-[transform,box-shadow,border-color] duration-500 ease-out hover:-translate-y-1 hover:border-green-200 hover:shadow-lg md:col-span-6'>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <h2 className='text-lg font-semibold text-gray-950'>
            {anotacao.criancaNome}
          </h2>
          <p className='mt-1 text-sm text-gray-600'>
            {anotacao.autorNome}
            {anotacao.autorEspecialidade && ` · ${anotacao.autorEspecialidade}`}
          </p>
        </div>
        <div className='flex flex-wrap items-center justify-end gap-2'>
          {podeGerenciar && (
            <Badge
              variant='outline'
              className='bg-gray-50 text-gray-700'
            >
              Sua anotação
            </Badge>
          )}
          <Badge
            variant='outline'
            className={
              isPrivate
                ? 'border-amber-200 bg-amber-50 text-amber-900'
                : 'border-green-200 bg-green-50 text-green-800'
            }
          >
            {isPrivate ? (
              <LockKeyhole
                aria-hidden='true'
                className='mr-1 h-3.5 w-3.5'
              />
            ) : (
              <Users
                aria-hidden='true'
                className='mr-1 h-3.5 w-3.5'
              />
            )}
            {isPrivate ? 'Privada' : 'Compartilhada'}
          </Badge>
        </div>
      </div>

      <p className='mt-5 flex-1 text-[0.95rem] leading-7 whitespace-pre-wrap text-gray-700'>
        {anotacao.conteudo}
      </p>

      <div className='mt-6 flex flex-col gap-4 border-t border-gray-100 pt-4'>
        <time
          dateTime={anotacao.createdAt}
          className='text-xs font-medium text-gray-500'
        >
          {dateFormatter.format(new Date(anotacao.createdAt))}
        </time>
        <div className='flex flex-wrap gap-2'>
          {!isPrivate && (
            <AiAnnotationAssistantTrigger
              annotationId={anotacao.id}
              onOpen={onOpenAi}
            />
          )}
          {podeGerenciar && onEdit && (
            <Button
              type='button'
              size='sm'
              variant='outline'
              onClick={() => onEdit(anotacao)}
              aria-label={`Editar anotação sobre ${anotacao.criancaNome}`}
            >
              <Pencil aria-hidden='true' />
              Editar
            </Button>
          )}
          {podeGerenciar && onDelete && (
            <Button
              type='button'
              size='sm'
              variant='outline'
              onClick={() => onDelete(anotacao)}
              className='border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800'
              aria-label={`Excluir anotação sobre ${anotacao.criancaNome}`}
            >
              <Trash2 aria-hidden='true' />
              Excluir
            </Button>
          )}
        </div>
      </div>
    </article>
  )
}
