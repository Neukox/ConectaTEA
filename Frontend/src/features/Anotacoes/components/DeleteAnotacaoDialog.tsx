import { AlertTriangle } from 'lucide-react'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import type { Anotacao } from '../types'

type Props = {
  anotacao?: Anotacao
  open: boolean
  isDeleting: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
}

export function DeleteAnotacaoDialog({
  anotacao,
  open,
  isDeleting,
  onOpenChange,
  onConfirm,
}: Props) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className='max-w-md rounded-2xl'>
        <DialogHeader>
          <div className='mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-700'>
            <AlertTriangle aria-hidden='true' />
          </div>
          <DialogTitle>Deseja excluir esta anotação?</DialogTitle>
          <DialogDescription>
            Esta ação removerá a anotação sobre {anotacao?.criancaNome}. A
            interface mock não poderá recuperá-la nesta sessão.
          </DialogDescription>
        </DialogHeader>
        <div className='mt-3 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end'>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            type='button'
            variant='destructive'
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Excluindo...' : 'Excluir anotação'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
