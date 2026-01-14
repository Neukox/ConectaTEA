import { FiClipboard } from 'react-icons/fi'
import type { IconType } from 'react-icons/lib'
import { cn } from '~/lib/utils'
import { Button } from '../ui'

interface NotFoundDataProps {
  title?: string
  subtitle?: string
  icon?: IconType
  className?: string
  onAction?: () => void
  actionLabel?: string
}

export default function NotFoundData({
  title = 'Nenhum dado encontrado',
  subtitle = 'Ainda não há dados para exibir aqui.',
  icon: Icon = FiClipboard,
  className,
  onAction,
  actionLabel = 'Voltar',
}: NotFoundDataProps) {
  return (
    <div
      className={cn(
        'mt-6 flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-12 text-center',
        className,
      )}
    >
      <div className='text-gray-400'>
        <Icon className='size-8' />
      </div>
      <h3 className='mt-2 text-sm font-semibold text-gray-900'>{title}</h3>
      <p className='mt-1 text-sm text-gray-500'>{subtitle}</p>
      {onAction && (
        <Button
          onClick={onAction}
          className='mt-4 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700'
        >
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
