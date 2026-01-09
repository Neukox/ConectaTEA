import { FiAlertTriangle } from 'react-icons/fi'
import { Button } from '~/components/ui/button'

interface DashboardCriancasProfissionalErrorProps {
  onRetry: () => void | Promise<unknown>
  isRetrying?: boolean
  errorMessage: string
  errorDescription?: string
}

export default function DashboardProfissionalError({
  onRetry,
  isRetrying = false,
  errorMessage,
  errorDescription,
}: DashboardCriancasProfissionalErrorProps) {
  return (
    <div className='flex h-full flex-col items-center gap-4 rounded-xl px-4 py-6 text-center'>
      <div className='flex flex-col items-center justify-center gap-3 text-red-700'>
        <div className='flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600'>
          <FiAlertTriangle className='size-6' />
        </div>
        <div className='text-center'>
          <p className='text-lg font-semibold'>{errorMessage}</p>
          <p className='text-sm text-red-600'>
            {errorDescription || 'Por favor, tente novamente.'}
          </p>
        </div>
      </div>
      <Button
        size='sm'
        className='w-fit'
        onClick={() => {
          void onRetry()
        }}
        disabled={isRetrying}
      >
        {isRetrying ? 'Tentando novamente...' : 'Tentar novamente'}
      </Button>
    </div>
  )
}
