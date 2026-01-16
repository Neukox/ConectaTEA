import { RefreshCw } from 'lucide-react'
import { FiAlertTriangle } from 'react-icons/fi'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'

interface ErrorContainerProps {
  onRetry?: () => void | Promise<unknown>
  isRetrying?: boolean
  errorMessage?: string
  errorDescription?: string
  className?: string
}

export function ErrorContainer({
  onRetry,
  isRetrying = false,
  errorMessage = 'Erro ao fazer a requisição',
  errorDescription = 'Não foi possível completar a ação. Por favor, tente novamente.',
  className,
}: ErrorContainerProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-8 text-center',
        className,
      )}
    >
      <div className='flex flex-col items-center justify-center gap-3 text-red-700'>
        <div className='flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600'>
          <FiAlertTriangle className='size-6' />
        </div>
        <div className='text-center'>
          <p className='text-lg font-semibold'>{errorMessage}</p>
          <p className='text-sm text-red-600'>{errorDescription}</p>
        </div>
      </div>
      {onRetry && (
        <Button
          size='default'
          variant='outline'
          className='gap-2 border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800'
          onClick={() => {
            void onRetry()
          }}
          disabled={isRetrying}
        >
          <RefreshCw className='size-4' />
          {isRetrying ? 'Tentando novamente...' : 'Tentar novamente'}
        </Button>
      )}
    </div>
  )
}
