import { AlertTriangle } from 'lucide-react'
import { PrioridadeMeta } from '../types'
import { cva } from 'class-variance-authority'
import { cn } from '~/lib/utils'

export interface AlertPrioridadeMetaProps {
  prioridade: PrioridadeMeta
}

const containerVariants = cva('rounded-xl border p-5', {
  variants: {
    prioridade: {
      ALTA: 'border-red-100 bg-red-50',
      MEDIA: 'border-amber-100 bg-amber-50',
      BAIXA: 'border-green-100 bg-green-50',
    },
  },
})

const textVariants = cva('', {
  variants: {
    prioridade: {
      ALTA: 'text-red-900',
      MEDIA: 'text-amber-900',
      BAIXA: 'text-green-900',
    },
  },
})

const iconVariants = cva('size-6 shrink-0', {
  variants: {
    prioridade: {
      ALTA: 'text-red-600',
      MEDIA: 'text-amber-600',
      BAIXA: 'text-green-600',
    },
  },
})

export default function AlertPrioridadeMeta({
  prioridade = 'BAIXA',
}: AlertPrioridadeMetaProps) {
  return (
    <div className={cn(containerVariants({ prioridade }))}>
      <div className='flex flex-col gap-3'>
        <div className='flex items-center gap-2'>
          <AlertTriangle className={cn(iconVariants({ prioridade }))} />
          <h4 className={cn(textVariants({ prioridade }), 'font-bold')}>
            Observação
          </h4>
        </div>
        <p className={cn(textVariants({ prioridade }))}>
          Esta meta possui prioridade{' '}
          <strong>{PrioridadeMeta[prioridade]}</strong>. Acompanhe de perto o
          progresso.
        </p>
      </div>
    </div>
  )
}
