import {
  ArrowLeft,
  Calendar,
  FileText,
  Target,
  TrendingUp,
  User,
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageLayout } from '~/components/layout/PageLayout'
import Header from '../../../components/layout/Header'
import { Badge } from '~/components/ui/badge'
import { ProgressBar } from '~/components/common/ProgressBar'
import AlertPrioridadeMeta from '~/features/Metas/components/AlertPrioridadeMeta'
import {
  CategoriaMeta,
  PrioridadeMeta,
  StatusMeta,
} from '~/features/Metas/types'
import { FaUserDoctor } from 'react-icons/fa6'
import useDetalhesMeta from '~/features/Metas/hooks/useDetalhesMeta'
import { format, formatDistance } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import NotFoundData from '~/components/common/NotFoundData'
import VerDetalhesMetaSkeleton from './VerDetalhesMetaSkeleton'
import { useMetasModal } from '~/features/Metas/hooks/useMetasModal'
import { useNotificacoesContext } from '~/api/barraNotificacao'
import { useEffect } from 'react'

export default function VerDetalhesMeta() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { notificarErro } = useNotificacoesContext()

  const metaId = Number(id)
  const isValidId = !isNaN(metaId) && metaId > 0

  console.log('metaId:', metaId)
  console.log('metaId is not nan:', !isNaN(metaId))
  console.log('metaId > 0 :', metaId > 0)
  console.log('isValidId:', isValidId)

  const { data: meta, isLoading, isError, error } = useDetalhesMeta(metaId)

  const { openAtualizarProgressoModal } = useMetasModal()

  useEffect(() => {
    let timer: NodeJS.Timeout

    if (isValidId === false) {
      notificarErro(
        'ID de meta inválido',
        'O ID fornecido para a meta é inválido.',
        { duration: 3000 },
      )

      timer = setTimeout(() => {
        navigate('/profissional/metas')
      }, 1000)
    }

    if (isError) {
      const errorMessage = 'Erro ao carregar dados da meta'

      const errorDescription =
        error?.response?.data?.message ||
        'Não foi possível carregar os detalhes da meta'

      notificarErro(errorMessage, errorDescription, { duration: 3000 })

      timer = setTimeout(() => {
        navigate('/profissional/metas')
      }, 1000)
    }

    return () => clearTimeout(timer)
  }, [isError, isValidId])

  // Estado de carregamento
  if (isLoading) {
    return <VerDetalhesMetaSkeleton />
  }

  if (isError) {
    return <VerDetalhesMetaSkeleton />
  }

  // Caso a meta não seja encontrada ou ID seja inválido
  if (!meta) {
    return (
      <NotFoundData
        title='Meta não encontrada'
        subtitle='A meta que você está tentando acessar não existe ou foi removida.'
        className='h-100 bg-gray-100'
        onAction={() => navigate('/profissional/metas')}
        actionLabel='Voltar para Metas'
      />
    )
  }

  let prioridadeTone: 'default' | 'success' | 'warning' | 'danger' = 'default'
  if (meta.prioridade === 'ALTA') prioridadeTone = 'danger'
  else if (meta.prioridade === 'MEDIA') prioridadeTone = 'warning'
  else prioridadeTone = 'default'

  return (
    <PageLayout>
      <Header
        title='Detalhes da Meta'
        description={`Visualizando detalhes da meta #${meta.id}`}
        className='items-center justify-between gap-4'
      >
        <button
          onClick={() => navigate('/profissional/metas')}
          className='flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50'
        >
          <ArrowLeft className='h-5 w-5' />
          Voltar
        </button>
      </Header>

      <div className='@container my-8 w-full max-w-5xl mx-auto'>
        {/* Card Principal */}
        <div className='flex flex-col gap-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm'>
          <div className='flex flex-col gap-6 @md:flex-row @md:items-center @md:justify-between'>
            <div>
              <div className='flex flex-wrap items-center gap-2'>
                <Badge
                  variant='outline'
                  tone={prioridadeTone}
                >
                  Prioridade {PrioridadeMeta[meta.prioridade]}
                </Badge>
                <span className='rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600'>
                  {CategoriaMeta[meta.categoria]}
                </span>
                <span className='rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700'>
                  {StatusMeta[meta.status]}
                </span>
              </div>
              <h1 className='mt-4 text-3xl font-bold text-gray-900'>
                {meta.titulo}
              </h1>
            </div>

            <button
              className='flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700'
              onClick={() =>
                openAtualizarProgressoModal({
                  id: meta.id,
                  titulo: meta.titulo,
                  progresso: meta.progresso.atual,
                })
              }
            >
              <TrendingUp className='h-4 w-4' />
              Atualizar Progresso
            </button>
          </div>

          <div className='grid grid-cols-1 gap-8 @md:grid-cols-[2fr_1fr]'>
            {/* Coluna Esquerda - Info Principal */}
            <div className='space-y-8 @2xl:col-span-1'>
              <section>
                <h3 className='flex items-center gap-2 text-lg font-semibold text-gray-900'>
                  <FileText className='h-5 w-5 text-green-600' />
                  Descrição
                </h3>
                <p className='mt-3 leading-relaxed text-gray-600'>
                  {meta.descricao ||
                    'Nenhuma descrição fornecida para esta meta.'}
                </p>
              </section>

              <section>
                <h3 className='flex items-center gap-2 text-lg font-semibold text-gray-900'>
                  <Target className='h-5 w-5 text-green-600' />
                  Progresso Atual
                </h3>
                <div className='mt-4 rounded-xl border border-gray-100 bg-gray-50 p-6'>
                  <div className='mb-2 flex items-center justify-between'>
                    <span className='font-medium text-gray-700'>Conclusão</span>
                    <span className='font-bold text-green-700'>
                      {meta.progresso.atual}%
                    </span>
                  </div>
                  <ProgressBar value={meta.progresso.atual} />
                  <p className='mt-4 text-sm text-gray-500'>
                    Última atualização:{' '}
                    {formatDistance(new Date(meta.progresso.data), new Date(), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </p>
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
                  <div className='flex items-start gap-3'>
                    <Calendar className='mt-0.5 h-5 w-5 text-gray-400' />
                    <div>
                      <p className='text-sm font-medium text-gray-900'>
                        Período
                      </p>
                      <p className='text-sm text-gray-600'>
                        {format(new Date(meta.dataInicio), 'dd/MM/yyyy')} -{' '}
                        {format(new Date(meta.dataFim), 'dd/MM/yyyy')}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-start gap-3'>
                    <User className='mt-0.5 h-5 w-5 text-gray-400' />
                    <div>
                      <p className='text-sm font-medium text-gray-900'>
                        Criança
                      </p>
                      <div className='mt-1 flex items-center gap-2'>
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(meta.crianca.nome)}&background=random`}
                          alt={meta.crianca.nome}
                          className='h-6 w-6 rounded-full'
                        />
                        <p className='text-sm text-gray-600'>
                          {meta.crianca.nome}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className='flex items-start gap-3'>
                    <FaUserDoctor className='mt-0.5 h-5 w-5 text-gray-400' />
                    <div>
                      <p className='text-sm font-medium text-gray-900'>
                        Profissional
                      </p>
                      <p className='text-sm text-gray-600'>
                        {meta.profissional.name}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card de alerta de prioridade */}
              {meta.prioridade !== 'BAIXA' && (
                <AlertPrioridadeMeta
                  prioridade={meta.prioridade.toUpperCase() as PrioridadeMeta}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
