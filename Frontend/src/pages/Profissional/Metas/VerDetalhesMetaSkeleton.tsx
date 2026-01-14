import { ArrowLeft, Calendar, FileText, Target, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageLayout } from '~/components/layout/PageLayout'
import Header from '../../../components/layout/Header'
import { Skeleton } from '~/components/ui/skeleton'
import { FaUserDoctor } from 'react-icons/fa6'

export default function VerDetalhesMetaSkeleton() {
  const navigate = useNavigate()

  return (
    <PageLayout>
      <Header
        title='Detalhes da Meta'
        description='Carregando detalhes da meta...'
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
        {/* Card Principal */}
        <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8'>
          <div className='flex flex-col gap-6 md:flex-row md:items-start md:justify-between'>
            <div className='flex-1'>
              <div className='flex items-center gap-3'>
                <Skeleton className='h-6 w-32' />
                <Skeleton className='h-6 w-24' />
                <Skeleton className='h-6 w-28' />
              </div>
              <Skeleton className='mt-4 h-9 w-3/4' />
            </div>
            <Skeleton className='h-10 w-48' />
          </div>

          <div className='mt-8 grid grid-cols-1 gap-8 md:grid-cols-3'>
            {/* Coluna Esquerda - Info Principal */}
            <div className='col-span-2 space-y-8'>
              {/* Descrição */}
              <section>
                <h3 className='flex items-center gap-2 text-lg font-semibold text-gray-900'>
                  <FileText className='h-5 w-5 text-green-600' />
                  Descrição
                </h3>
                <div className='mt-3 space-y-2'>
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-4 w-3/4' />
                </div>
              </section>

              {/* Progresso */}
              <section>
                <h3 className='flex items-center gap-2 text-lg font-semibold text-gray-900'>
                  <Target className='h-5 w-5 text-green-600' />
                  Progresso Atual
                </h3>
                <div className='mt-4 rounded-xl border border-gray-100 bg-gray-50 p-6'>
                  <div className='mb-2 flex items-center justify-between'>
                    <Skeleton className='h-5 w-20' />
                    <Skeleton className='h-5 w-12' />
                  </div>
                  <Skeleton className='h-3 w-full rounded-full' />
                  <Skeleton className='mt-4 h-4 w-48' />
                </div>
              </section>
            </div>

            {/* Coluna Direita - Detalhes Laterais */}
            <div className='space-y-6'>
              <div className='rounded-xl border border-gray-200 p-5'>
                <h4 className='mb-4 font-semibold text-gray-900'>
                  Informações
                </h4>

                <div className='space-y-4'>
                  {/* Período */}
                  <div className='flex items-start gap-3'>
                    <Calendar className='mt-0.5 h-5 w-5 text-gray-400' />
                    <div className='flex-1'>
                      <p className='text-sm font-medium text-gray-900'>
                        Período
                      </p>
                      <Skeleton className='mt-1 h-4 w-full' />
                    </div>
                  </div>

                  {/* Criança */}
                  <div className='flex items-start gap-3'>
                    <User className='mt-0.5 h-5 w-5 text-gray-400' />
                    <div className='flex-1'>
                      <p className='text-sm font-medium text-gray-900'>
                        Criança
                      </p>
                      <div className='mt-1 flex items-center gap-2'>
                        <Skeleton className='h-6 w-6 rounded-full' />
                        <Skeleton className='h-4 w-24' />
                      </div>
                    </div>
                  </div>

                  {/* Profissional */}
                  <div className='flex items-start gap-3'>
                    <FaUserDoctor className='mt-0.5 h-5 w-5 text-gray-400' />
                    <div className='flex-1'>
                      <p className='text-sm font-medium text-gray-900'>
                        Profissional
                      </p>
                      <Skeleton className='mt-1 h-4 w-32' />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card de alerta placeholder */}
              <Skeleton className='h-32 w-full rounded-xl' />
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
