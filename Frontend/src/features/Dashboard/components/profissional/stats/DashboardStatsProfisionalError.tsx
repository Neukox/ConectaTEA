import { FiAlertTriangle } from 'react-icons/fi'
import { Button } from '~/components/ui/button'

interface DashboardStatsProfisionalErrorProps {
  onRetry: () => void | Promise<unknown>
  isRetrying?: boolean
}

export default function DashboardStatsProfisionalError({
  onRetry,
  isRetrying = false,
}: DashboardStatsProfisionalErrorProps) {
  return (
    <div className='flex flex-col items-center justify-center gap-4 rounded-2xl border border-red-300 bg-red-50 p-6 shadow mb-8'>
      <div className='flex items-center gap-4'>
          <div className='flex h-14 w-14 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600'>
            <FiAlertTriangle className='size-6' />
          </div>
          <p className='text-lg font-semibold text-red-700'>
            Erro ao carregar os dados
          </p>
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
