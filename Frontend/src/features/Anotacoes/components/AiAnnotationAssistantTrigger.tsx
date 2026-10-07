import { Sparkles } from 'lucide-react'
import { Button } from '~/components/ui/button'

type Props = { annotationId: number; onOpen: (annotationId: number) => void }

export function AiAnnotationAssistantTrigger({ annotationId, onOpen }: Props) {
  return (
    <Button
      type='button'
      variant='outline'
      size='sm'
      onClick={() => onOpen(annotationId)}
      className='border-green-200 text-green-800 hover:bg-green-50'
      aria-label='Explicar esta anotação com o Assistente ConectaTEA'
    >
      <Sparkles aria-hidden='true' />
      Explicar com IA
    </Button>
  )
}
