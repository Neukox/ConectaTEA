import { Sparkles } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'

type Props = {
  annotationId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AiAnnotationAssistantDialog({
  annotationId,
  open,
  onOpenChange,
}: Props) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className='max-w-md rounded-2xl border-green-100'>
        <DialogHeader>
          <div className='mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700'>
            <Sparkles aria-hidden='true' />
          </div>
          <DialogTitle>Assistente ConectaTEA</DialogTitle>
          <DialogDescription className='pt-2 leading-6 text-gray-600'>
            <strong className='block text-gray-900'>
              Este recurso está sendo preparado.
            </strong>
            No futuro, o assistente poderá ajudar a explicar esta anotação
            usando somente informações às quais você possui acesso.
          </DialogDescription>
        </DialogHeader>
        <p className='sr-only'>Anotação selecionada: {annotationId}</p>
      </DialogContent>
    </Dialog>
  )
}
