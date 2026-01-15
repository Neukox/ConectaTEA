import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { useNotificacoesContext } from '~/api/barraNotificacao'
import useAtualizarProgresso from '../hooks/useAtualizarProgresso'

interface AtualizarProgressoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  meta: { id: number; titulo: string; progresso: number } | null
}

export function AtualizarProgressoDialog({
  open,
  onOpenChange,
  onSuccess,
  meta,
}: AtualizarProgressoDialogProps) {
  const { notificarSucesso, notificarErro } = useNotificacoesContext()
  const [progresso, setProgresso] = useState(0)
  const [descricao, setDescricao] = useState('')

  useEffect(() => {
    if (open && meta) {
      setProgresso(meta.progresso)
    }
  }, [open, meta])

  // Usar o hook de mutação com atualização optimista
  const mutation = useAtualizarProgresso({
    success: () => {
      notificarSucesso(
        'Progresso atualizado!',
        `O progresso da meta "${meta?.titulo}" foi atualizado para ${progresso}%.`,
        { duration: 5000 },
      )
      onOpenChange(false)
      onSuccess?.()
    },
    error: (error) => {
      console.error('Erro ao atualizar progresso da meta:', error)
      notificarErro(
        'Erro ao atualizar',
        'Não foi possível atualizar o progresso da meta.',
        { duration: 5000 },
      )
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!meta) return

    mutation.mutate({
      id: meta.id,
      progresso,
      descricao,
    })
  }

  console.log('Renderizando AtualizarProgressoDialog com meta:', meta)
  
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Atualizar Progresso</DialogTitle>
          <DialogDescription>
            Defina o novo percentual de conclusão para a meta:
            <br />
            <span className='font-semibold text-gray-900'>{meta?.titulo}</span>
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className='space-y-6 py-4'
        >
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <span className='text-sm font-medium text-gray-700'>
                Progresso:
              </span>
              <span className='text-lg font-bold text-green-600'>
                {progresso}%
              </span>
            </div>
            <input
              type='range'
              min='0'
              max='100'
              step='5'
              value={progresso}
              onChange={(e) => setProgresso(Number(e.target.value))}
              className='h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-green-600'
            />
            <div className='flex justify-between text-xs text-gray-500'>
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
          <div>
            <label
              htmlFor='descricao'
              className='mb-2 block text-sm font-medium text-gray-700'
            >
              Descrição (opcional)
            </label>
            <textarea
              id='descricao'
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className='w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-green-500 focus:outline-none'
              placeholder='Descreva o que foi feito para alcançar esse progresso...'
              rows={4}
            />
          </div>

          <div className='flex gap-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              className='flex-1'
              disabled={mutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type='submit'
              className='flex-1 bg-green-600 hover:bg-green-700'
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
