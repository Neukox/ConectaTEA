import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { atualizarProgresso } from '../../api/protected/axiosMetas'
import { useNotificacoesContext } from '../../api/barraNotificacao'

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
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && meta) {
      setProgresso(meta.progresso)
    }
  }, [open, meta])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!meta) return

    setLoading(true)
    try {
      await atualizarProgresso(meta.id, progresso)
      notificarSucesso(
        'Progresso atualizado!',
        `O progresso da meta "${meta.titulo}" foi atualizado para ${progresso}%.`,
        { duration: 5000 },
      )
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error)
      notificarErro(
        'Erro ao atualizar',
        'Não foi possível atualizar o progresso da meta.',
        { duration: 5000 },
      )
    } finally {
      setLoading(false)
    }
  }

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

          <div className='flex gap-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              className='flex-1'
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type='submit'
              className='flex-1 bg-green-600 hover:bg-green-700'
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
