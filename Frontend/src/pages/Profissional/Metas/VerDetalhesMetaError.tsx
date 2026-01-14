import { FiAlertTriangle } from 'react-icons/fi'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '~/components/ui/button'
import { PageLayout } from '~/components/layout/PageLayout'
import Header from '../../../components/layout/Header'

interface VerDetalhesMetaErrorProps {
  onRetry: () => void | Promise<unknown>
  isRetrying?: boolean
  errorMessage?: string
  errorDescription?: string
}

export default function VerDetalhesMetaError({
  onRetry,
  isRetrying = false,
  errorMessage = 'Erro ao carregar detalhes da meta',
  errorDescription = 'Não foi possível carregar os detalhes da meta. Por favor, tente novamente.',
}: VerDetalhesMetaErrorProps) {
  const navigate = useNavigate()

  return (
    <PageLayout>
      <Header
        title='Detalhes da Meta'
        description='Erro ao carregar detalhes'
      >
        <button
          onClick={() => navigate('/profissional/metas')}
          className='flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50'
        >
          <ArrowLeft className='h-5 w-5' />
          Voltar
        </button>
      </Header>

      <div className='mx-auto mt-8 max-w-5xl px-4 pb-12'>
        <div className='flex h-full min-h-100 flex-col items-center justify-center gap-6 rounded-2xl border border-red-200 bg-red-50 p-8 text-center'>
          <div className='flex flex-col items-center justify-center gap-4 text-red-700'>
            <div className='flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600'>
              <FiAlertTriangle className='size-8' />
            </div>
            <div className='text-center'>
              <p className='text-xl font-semibold'>{errorMessage}</p>
              <p className='mt-2 text-sm text-red-600'>{errorDescription}</p>
            </div>
          </div>
          <div className='flex flex-col gap-3 sm:flex-row'>
            <Button
              size='default'
              variant='default'
              onClick={() => {
                void onRetry()
              }}
              disabled={isRetrying}
            >
              {isRetrying ? 'Tentando novamente...' : 'Tentar novamente'}
            </Button>
            <Button
              size='default'
              variant='outline'
              onClick={() => navigate('/profissional/metas')}
            >
              Voltar para Metas
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
